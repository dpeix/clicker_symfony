import { Controller } from '@hotwired/stimulus';

/**
 * Contrôleur Stimulus pour le jeu de clic rapide
 * Le joueur doit cliquer le plus rapidement possible en 10 secondes
 */
export default class extends Controller {
    static targets = ['clickButton', 'timer', 'score', 'playerName', 'message', 'startButton', 'modalOverlay', 'modalContent', 'modalScore', 'modalLeaderboard', 'modalTitle', 'modalScoreDisplay', 'modalFooter', 'countdownOverlay', 'countdownNumber', 'clickZone', 'clickZoneIndicator']
    static values = {
        duration: { type: Number, default: 10 },
        saveUrl: { type: String, default: '/save-score' },
        leaderboardUrl: { type: String, default: '/leaderboard' }
    }

    connect() {
        this.score = 0;
        this.timeLeft = this.durationValue;
        this.isPlaying = false;
        this.timerInterval = null;
        this.updateDisplay();
    }

    disconnect() {
        this.stopTimer();
    }

    /**
     * Démarre une nouvelle partie avec décompte
     */
    start() {
        if (this.isPlaying) return;
        
        // Fermer la modale si elle est ouverte
        this.closeModal();
        
        // Réinitialiser le score et le temps
        this.score = 0;
        this.timeLeft = this.durationValue;
        
        // Masquer le bouton de démarrage
        if (this.hasStartButtonTarget) {
            this.startButtonTarget.style.display = 'none';
        }
        
        // Masquer le bouton de clic et afficher l'indicateur
        if (this.hasClickButtonTarget) {
            this.clickButtonTarget.style.display = 'none';
        }
        if (this.hasClickZoneIndicatorTarget) {
            this.clickZoneIndicatorTarget.style.display = 'flex';
        }
        
        // Réinitialiser le message
        if (this.hasMessageTarget) {
            this.messageTarget.textContent = '';
            this.messageTarget.style.display = 'none';
        }
        
        // Démarrer le décompte
        this.startCountdown();
    }

    /**
     * Démarre le décompte 3, 2, 1
     */
    startCountdown() {
        if (!this.hasCountdownOverlayTarget || !this.hasCountdownNumberTarget) {
            // Si pas de décompte, démarrer directement
            this.beginGame();
            return;
        }
        
        let count = 3;
        this.countdownOverlayTarget.style.display = 'flex';
        this.countdownNumberTarget.textContent = count;
        this.countdownNumberTarget.classList.add('countdown-pulse');
        
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                this.countdownNumberTarget.textContent = count;
                // Animation de pulse pour chaque nombre
                this.countdownNumberTarget.classList.remove('countdown-pulse');
                setTimeout(() => {
                    this.countdownNumberTarget.classList.add('countdown-pulse');
                }, 10);
            } else {
                // Afficher "GO!" avant de démarrer
                this.countdownNumberTarget.textContent = 'GO!';
                this.countdownNumberTarget.classList.remove('countdown-pulse');
                this.countdownNumberTarget.classList.add('countdown-go');
                
                clearInterval(countdownInterval);
                
                // Démarrer le jeu après un court délai
                setTimeout(() => {
                    this.countdownOverlayTarget.style.display = 'none';
                    this.countdownNumberTarget.classList.remove('countdown-go');
                    this.beginGame();
                }, 500);
            }
        }, 1000);
    }

    /**
     * Démarre réellement le jeu après le décompte
     */
    beginGame() {
        this.isPlaying = true;
        
        // Masquer l'indicateur et afficher le bouton de clic
        if (this.hasClickZoneIndicatorTarget) {
            this.clickZoneIndicatorTarget.style.display = 'none';
        }
        
        if (this.hasClickButtonTarget) {
            this.clickButtonTarget.style.display = 'flex';
            this.clickButtonTarget.disabled = false;
        }
        
        this.updateDisplay();
        this.startTimer();
    }

    /**
     * Gère le clic sur le bouton pendant le jeu
     */
    click() {
        if (!this.isPlaying) return;
        
        this.score++;
        this.updateDisplay();
        
        // Animation du bouton
        if (this.hasClickButtonTarget) {
            this.clickButtonTarget.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (this.clickButtonTarget) {
                    this.clickButtonTarget.style.transform = 'scale(1)';
                }
            }, 100);
        }
    }

    /**
     * Démarre le timer
     */
    startTimer() {
        this.stopTimer(); // S'assurer qu'il n'y a pas de timer en cours
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * Arrête le timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Termine la partie
     */
    endGame() {
        this.stopTimer();
        this.isPlaying = false;
        this.timeLeft = 0;
        
        // Masquer le bouton de clic et réafficher l'indicateur
        if (this.hasClickButtonTarget) {
            this.clickButtonTarget.disabled = true;
            this.clickButtonTarget.style.display = 'none';
        }
        if (this.hasClickZoneIndicatorTarget) {
            this.clickZoneIndicatorTarget.style.display = 'flex';
        }
        
        // Afficher le bouton de démarrage
        if (this.hasStartButtonTarget) {
            this.startButtonTarget.style.display = 'block';
        }
        
        // Sauvegarder le score
        this.saveScore();
    }

    /**
     * Sauvegarde le score en base de données
     */
    async saveScore() {
        const playerName = this.hasPlayerNameTarget && this.playerNameTarget.value 
            ? this.playerNameTarget.value.trim() 
            : 'Anonyme';
        
        if (!playerName) {
            this.showMessage('Veuillez entrer un nom de joueur', 'error');
            return;
        }
        
        try {
            const response = await fetch(this.saveUrlValue, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: this.score,
                    player: playerName
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }
            
            const data = await response.json();
            
            // Afficher la modale avec le leaderboard après la sauvegarde
            this.showModal();
        } catch (error) {
            console.error('Erreur:', error);
            this.showMessage(
                'Erreur lors de la sauvegarde du score. Votre score local: ' + this.score,
                'error'
            );
        }
    }

    /**
     * Charge le leaderboard depuis l'API
     */
    async loadLeaderboard() {
        if (!this.hasLeaderboardTarget) return;
        
        try {
            const response = await fetch(this.leaderboardUrlValue);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du leaderboard');
            }
            
            const data = await response.json();
            
            if (data.success && data.leaderboard) {
                this.renderLeaderboard(data.leaderboard);
            } else {
                this.renderLeaderboard([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du leaderboard:', error);
            if (this.hasLeaderboardTarget) {
                this.leaderboardTarget.innerHTML = '<div class="leaderboard-error">Erreur lors du chargement du classement</div>';
            }
        }
    }

    /**
     * Affiche le leaderboard dans le DOM
     */
    renderLeaderboard(leaderboard) {
        if (!this.hasLeaderboardTarget) return;
        
        if (leaderboard.length === 0) {
            this.leaderboardTarget.innerHTML = '<div class="leaderboard-empty">Aucun score encore enregistré</div>';
            return;
        }
        
        let html = '<ol class="leaderboard-list">';
        
        leaderboard.forEach((entry) => {
            const medal = this.getMedalEmoji(entry.rank);
            html += `
                <li class="leaderboard-item">
                    <span class="leaderboard-rank">${medal} ${entry.rank}</span>
                    <span class="leaderboard-player">${this.escapeHtml(entry.player)}</span>
                    <span class="leaderboard-score">${entry.score} clics</span>
                </li>
            `;
        });
        
        html += '</ol>';
        this.leaderboardTarget.innerHTML = html;
    }

    /**
     * Retourne l'emoji de médaille selon le rang
     */
    getMedalEmoji(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}.`;
        }
    }

    /**
     * Échappe le HTML pour éviter les injections XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Affiche un message à l'utilisateur
     */
    showMessage(text, type = 'info') {
        if (this.hasMessageTarget) {
            this.messageTarget.textContent = text;
            this.messageTarget.className = `game-message game-message-${type}`;
            this.messageTarget.style.display = 'block';
        }
    }

    /**
     * Affiche la modale avec le leaderboard à la fin de la partie
     */
    async showModal() {
        await this.openModal(true, '🏆 Fin de la partie !', true);
    }

    /**
     * Affiche la modale du leaderboard manuellement (sans score de fin de partie)
     */
    async showLeaderboard() {
        await this.openModal(false, '🏆 Classement', false);
    }

    /**
     * Ouvre la modale avec le leaderboard
     * @param {boolean} showScore - Afficher le score de fin de partie
     * @param {string} title - Titre de la modale
     * @param {boolean} showFooter - Afficher le footer avec le bouton Rejouer
     */
    async openModal(showScore = false, title = '🏆 Classement', showFooter = false) {
        if (!this.hasModalOverlayTarget || !this.hasModalContentTarget) {
            console.error('Modal targets not found');
            return;
        }
        
        // Définir le titre
        if (this.hasModalTitleTarget) {
            this.modalTitleTarget.textContent = title;
        }
        
        // Afficher ou masquer le score de fin de partie
        if (this.hasModalScoreDisplayTarget) {
            this.modalScoreDisplayTarget.style.display = showScore ? 'block' : 'none';
        }
        
        // Afficher le score si nécessaire
        if (showScore && this.hasModalScoreTarget) {
            this.modalScoreTarget.textContent = this.score;
        }
        
        // Afficher ou masquer le footer
        if (this.hasModalFooterTarget) {
            this.modalFooterTarget.style.display = showFooter ? 'block' : 'none';
        }
        
        // Afficher la modale d'abord
        this.modalOverlayTarget.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Empêcher le scroll
        
        // Animation d'entrée
        setTimeout(() => {
            if (this.hasModalContentTarget) {
                this.modalContentTarget.classList.add('modal-show');
            }
        }, 10);
        
        // Charger et afficher le leaderboard dans la modale
        await this.loadModalLeaderboard();
    }

    /**
     * Ferme la modale
     * @param {Event} event - L'événement de clic (optionnel)
     */
    closeModal(event) {
        if (event) {
            // Empêcher la propagation si on clique sur le bouton close
            event.stopPropagation();
        }
        
        if (!this.hasModalOverlayTarget) return;
        
        // Animation de sortie
        if (this.hasModalContentTarget) {
            this.modalContentTarget.classList.remove('modal-show');
        }
        
        setTimeout(() => {
            this.modalOverlayTarget.style.display = 'none';
            document.body.style.overflow = ''; // Réactiver le scroll
        }, 300);
    }

    /**
     * Empêche la propagation de l'événement de clic sur le contenu de la modale
     * pour éviter de fermer la modale quand on clique à l'intérieur
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Charge le leaderboard dans la modale
     */
    async loadModalLeaderboard() {
        if (!this.hasModalLeaderboardTarget) {
            console.error('modalLeaderboard target not found');
            return;
        }
        
        // Afficher un message de chargement
        this.modalLeaderboardTarget.innerHTML = '<div class="leaderboard-loading">Chargement du classement...</div>';
        
        try {
            const response = await fetch(this.leaderboardUrlValue);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Leaderboard data:', data);
            
            if (data.success !== false && Array.isArray(data.leaderboard)) {
                this.renderModalLeaderboard(data.leaderboard);
            } else {
                console.warn('Leaderboard data format unexpected:', data);
                this.modalLeaderboardTarget.innerHTML = '<div class="leaderboard-empty">Aucun score encore enregistré</div>';
            }
        } catch (error) {
            console.error('Erreur lors du chargement du leaderboard:', error);
            this.modalLeaderboardTarget.innerHTML = '<div class="leaderboard-error">Erreur lors du chargement du classement. Veuillez réessayer.</div>';
        }
    }

    /**
     * Affiche le leaderboard dans la modale
     */
    renderModalLeaderboard(leaderboard) {
        if (!this.hasModalLeaderboardTarget) {
            console.error('modalLeaderboard target not found in renderModalLeaderboard');
            return;
        }
        
        if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
            this.modalLeaderboardTarget.innerHTML = '<div class="leaderboard-empty">Aucun score encore enregistré. Soyez le premier !</div>';
            return;
        }
        
        let html = '<ol class="leaderboard-list modal-leaderboard-list-inner">';
        
        leaderboard.forEach((entry) => {
            if (!entry || typeof entry !== 'object') {
                console.warn('Invalid leaderboard entry:', entry);
                return;
            }
            
            const rank = entry.rank || 0;
            const player = entry.player || 'Anonyme';
            const score = entry.score || 0;
            const medal = this.getMedalEmoji(rank);
            
            html += `
                <li class="leaderboard-item">
                    <span class="leaderboard-rank">${medal} ${rank}</span>
                    <span class="leaderboard-player">${this.escapeHtml(player)}</span>
                    <span class="leaderboard-score">${score} clics</span>
                </li>
            `;
        });
        
        html += '</ol>';
        this.modalLeaderboardTarget.innerHTML = html;
    }

    /**
     * Met à jour l'affichage
     */
    updateDisplay() {
        if (this.hasScoreTarget) {
            this.scoreTarget.textContent = this.score;
        }
        
        if (this.hasTimerTarget) {
            this.timerTarget.textContent = this.timeLeft;
            
            // Changer la couleur selon le temps restant
            if (this.timeLeft <= 3) {
                this.timerTarget.style.color = '#f44336';
            } else if (this.timeLeft <= 5) {
                this.timerTarget.style.color = '#ff9800';
            } else {
                this.timerTarget.style.color = '#4a90e2';
            }
        }
    }
}
