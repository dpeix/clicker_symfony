<?php

namespace App\Service;

use Redis;

/**
 * Service pour gérer le leaderboard avec Redis
 * Utilise des Sorted Sets pour maintenir automatiquement le classement
 */
class LeaderboardService
{
    private const LEADERBOARD_KEY = 'click_game:leaderboard';
    private const MAX_LEADERBOARD_SIZE = 1000; // Limite pour éviter une croissance infinie

    public function __construct(
        private readonly Redis $redis
    ) {
        // Ne pas se connecter dans le constructeur pour éviter les erreurs au démarrage
        // La connexion sera établie lors de la première utilisation
    }

    /**
     * S'assure que Redis est connecté
     */
    private function ensureConnection(): void
    {
        try {
            // Vérifier si Redis est déjà connecté
            if (method_exists($this->redis, 'isConnected') && $this->redis->isConnected()) {
                return;
            }
            
            // Tester la connexion avec ping (peut échouer si non connecté)
            try {
                $pingResult = $this->redis->ping();
                if ($pingResult !== false) {
                    return; // Déjà connecté
                }
            } catch (\RedisException $e) {
                // Ping a échoué, on va se reconnecter
            }
            
            // Se connecter si nécessaire
            $this->redis->connect('redis', 6379, 2); // timeout de 2 secondes
            
        } catch (\RedisException $e) {
            // Si la connexion échoue, on log l'erreur et on relance
            error_log('Erreur de connexion Redis: ' . $e->getMessage());
            throw new \RuntimeException('Impossible de se connecter à Redis: ' . $e->getMessage(), 0, $e);
        } catch (\Exception $e) {
            error_log('Erreur inattendue Redis: ' . $e->getMessage());
            throw new \RuntimeException('Erreur Redis: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Ajoute ou met à jour un score dans le leaderboard
     * 
     * @param string $player Nom du joueur
     * @param int $score Score du joueur
     * @return bool True si le score a été ajouté/mis à jour
     */
    public function addScore(string $player, int $score): bool
    {
        if ($score < 0) {
            return false;
        }

        try {
            $this->ensureConnection();

            // Utiliser le score comme valeur pour le tri décroissant
            // Redis Sorted Sets trient par score, donc les meilleurs scores seront en haut
            $result = $this->redis->zAdd(
                self::LEADERBOARD_KEY,
                $score,
                $this->formatPlayerKey($player, $score)
            );

            // Nettoyer les anciennes entrées si nécessaire (garder seulement les meilleurs)
            $this->cleanupLeaderboard();

            return $result !== false;
        } catch (\Exception $e) {
            error_log('Erreur lors de l\'ajout du score dans Redis: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Récupère le top N des meilleurs scores
     * 
     * @param int $limit Nombre de scores à récupérer (défaut: 5)
     * @return array Tableau de scores avec ['player' => string, 'score' => int, 'rank' => int]
     */
    public function getTopScores(int $limit = 5): array
    {
        try {
            $this->ensureConnection();

            // Récupérer les meilleurs scores (tri décroissant)
            // ZREVRANGE retourne les membres avec leurs scores dans l'ordre décroissant
            $scores = $this->redis->zRevRange(
                self::LEADERBOARD_KEY,
                0,
                $limit - 1,
                true // Retourner aussi les scores
            );

            if ($scores === false || empty($scores)) {
                return [];
            }

            $leaderboard = [];
            $rank = 1;

            foreach ($scores as $member => $score) {
                // Extraire le nom du joueur depuis la clé formatée
                $player = $this->extractPlayerFromKey($member);
                
                $leaderboard[] = [
                    'rank' => $rank++,
                    'player' => $player,
                    'score' => (int) $score,
                ];
            }

            return $leaderboard;
        } catch (\Exception $e) {
            error_log('Erreur lors de la récupération du leaderboard: ' . $e->getMessage());
            // Retourner un tableau vide plutôt que de lancer une exception
            // pour permettre à l'application de continuer à fonctionner
            return [];
        }
    }

    /**
     * Récupère le rang d'un joueur spécifique
     * 
     * @param string $player Nom du joueur
     * @return int|null Le rang du joueur (1 = meilleur) ou null si non trouvé
     */
    public function getPlayerRank(string $player): ?int
    {
        // Chercher toutes les entrées pour ce joueur
        $pattern = $this->formatPlayerKey($player, '*');
        $members = $this->redis->zRangeByScore(
            self::LEADERBOARD_KEY,
            '-inf',
            '+inf',
            ['withscores' => true]
        );

        $bestScore = null;
        $bestMember = null;

        foreach ($members as $member => $score) {
            if ($this->extractPlayerFromKey($member) === $player) {
                if ($bestScore === null || $score > $bestScore) {
                    $bestScore = $score;
                    $bestMember = $member;
                }
            }
        }

        if ($bestMember === null) {
            return null;
        }

        // Obtenir le rang (0-indexed, donc +1 pour avoir le rang réel)
        $rank = $this->redis->zRevRank(self::LEADERBOARD_KEY, $bestMember);
        
        return $rank !== false ? $rank + 1 : null;
    }

    /**
     * Formate la clé du joueur pour Redis
     * Inclut le score pour permettre plusieurs scores par joueur
     * 
     * @param string $player Nom du joueur
     * @param int|string $score Score ou '*' pour les patterns
     * @return string Clé formatée
     */
    private function formatPlayerKey(string $player, int|string $score): string
    {
        $timestamp = time();
        return sprintf('%s:%d:%d', $player, $score, $timestamp);
    }

    /**
     * Extrait le nom du joueur depuis une clé formatée
     * 
     * @param string $key Clé Redis
     * @return string Nom du joueur
     */
    private function extractPlayerFromKey(string $key): string
    {
        // Format: "player:score:timestamp"
        $parts = explode(':', $key, 2);
        return $parts[0] ?? 'Anonyme';
    }

    /**
     * Nettoie le leaderboard en gardant seulement les meilleurs scores
     */
    private function cleanupLeaderboard(): void
    {
        $count = $this->redis->zCard(self::LEADERBOARD_KEY);
        
        if ($count > self::MAX_LEADERBOARD_SIZE) {
            // Supprimer les scores les plus bas
            $removeCount = $count - self::MAX_LEADERBOARD_SIZE;
            $this->redis->zRemRangeByRank(
                self::LEADERBOARD_KEY,
                0,
                $removeCount - 1
            );
        }
    }

    /**
     * Vide complètement le leaderboard (utile pour les tests)
     */
    public function clearLeaderboard(): void
    {
        $this->redis->del(self::LEADERBOARD_KEY);
    }

    /**
     * Récupère le nombre total de scores dans le leaderboard
     */
    public function getTotalScores(): int
    {
        return $this->redis->zCard(self::LEADERBOARD_KEY);
    }
}
