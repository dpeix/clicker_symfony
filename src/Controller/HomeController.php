<?php

namespace App\Controller;

use App\Entity\Score;
use App\Repository\ScoreRepository;
use App\Service\LeaderboardService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig', [
            'controller_name' => 'HomeController',
        ]);
    }

    #[Route('/save-score', name: 'app_save_score', methods: ['POST'])]
    public function saveScore(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        LeaderboardService $leaderboardService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['score']) || !isset($data['player'])) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données manquantes'
            ], 400);
        }

        $scoreValue = (int) $data['score'];
        $player = trim($data['player']);

        // Validation du score
        if ($scoreValue < 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Le score doit être positif'
            ], 400);
        }

        // Validation du nom du joueur
        if (empty($player)) {
            $player = 'Anonyme';
        }

        if (strlen($player) > 255) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Le nom du joueur est trop long'
            ], 400);
        }

        // Sauvegarde en base de données (pour historique)
        $score = new Score();
        $score->setScore($scoreValue);
        $score->setPlayer($player);
        $score->setCreatedAt(new \DateTimeImmutable());

        $errors = $validator->validate($score);
        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur de validation'
            ], 400);
        }

        $entityManager->persist($score);
        $entityManager->flush();

        // Sauvegarde dans Redis pour le leaderboard
        try {
            $leaderboardService->addScore($player, $scoreValue);
        } catch (\Exception $e) {
            // Log l'erreur mais ne bloque pas la réponse
            // Le score est déjà sauvegardé en base de données
        }

        return new JsonResponse([
            'success' => true,
            'message' => 'Score sauvegardé avec succès',
            'score' => $score->getId()
        ], 201);
    }

    #[Route('/leaderboard', name: 'app_leaderboard', methods: ['GET'])]
    public function getLeaderboard(LeaderboardService $leaderboardService): JsonResponse
    {
        try {
            $topScores = $leaderboardService->getTopScores(5);
            
            return new JsonResponse([
                'success' => true,
                'leaderboard' => $topScores
            ]);
        } catch (\RuntimeException $e) {
            // Erreur de connexion Redis - retourner un tableau vide plutôt qu'une erreur 500
            return new JsonResponse([
                'success' => true,
                'message' => 'Leaderboard temporairement indisponible',
                'leaderboard' => []
            ]);
        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            error_log('Erreur leaderboard: ' . $e->getMessage());
            
            return new JsonResponse([
                'success' => true,
                'message' => 'Erreur lors de la récupération du leaderboard',
                'leaderboard' => []
            ]);
        }
    }
}
