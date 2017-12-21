arcs_module(
    function(ARCS,_three) {
        var GameManager ;

        /**
         * @class ObjectTransform
         * @classdesc Apply transformations to objects
         */
         GameManager = ARCS.Component.create(
            function() {
                var turnOfPlayer1 = true; // true si c'est le tour du joueur 1, sinon false
                var canPlay = false; // true si le joueur peut exécuter un mouvement, sinon false
                var hasBegun = false; // true quand les 12 markers ont été détectés
                var updateMarkersRolling = false; // true quand la fonction updateMarkers est en cours de traitement
                var hasSelected = false; // true si un joueur a déjà sélectionné un marker pendant son tour

                var firstPlayerMarkers = [1, 86, 170, 255, 342, 423];
                var secondPlayerMarkers = [510, 595, 679, 765, 937, 1019];

                var firstPlayerPoints = 0;
                var secondPlayerPoints = 0;

                var holesInOrder = secondPlayerMarkers.concat(firstPlayerMarkers.reverse()); // greniers dans l'ordre trigonométrique
                var seedsRecoltCounter = new Array(12).fill(0); // utilisé pour calculer les récoltes, réinitialisé à zéro à chaque tour
                var seedsGlobalCounter = new Array(12).fill(4); // stocke le nombre de seeds par grenier

                var timerMarkers = {
                    "1" : -1,
                    "86" : -1,
                    "170" : -1,
                    "255" : -1,
                    "342" : -1,
                    "423" : -1,
                    "510" : -1,
                    "595" : -1,
                    "679" : -1,
                    "765" : -1,
                    "937" : -1,
                    "1019" : -1
                };

                /**
                 * Détermine le marker sélectionné par le joueur. Affiche le score des joueurs et
                 * à qui est-ce le tour.
                 * @param markers {Array} tableau contenant les objets correspondant aux markers identifiés
                 * @function GameManager#updateMarkers
                 */
                 this.updateMarkers = function (markers) {
                    var markersIDS = []; // contiendra les identifiants des markers reconnus
                    var turnMarkers; // markers sélectionnables pour ce tour (ceux du joueur 1 si c'est le tour du joueur 1)
                    var markersToEmpty; // markers à vider en cas de non possibilité de mouvement
                    var k, id, time, timeDiff, holeIndex;

                    var checkVictory = function(element) {
                        return element > 0;
                    };

                    var checkCanPlay = function(id) {
                        holeIndex = holesInOrder.indexOf(id);
                        return seedsGlobalCounter[holeIndex] > 0;
                    }

                    // On vérfie que le jeu n'est pas fini
                    if(seedsGlobalCounter.find(checkVictory) == undefined) {
                        this.displayFinalPanel();
                        this.emit("endOfGame");
                    }

                    // On parcourt l'array d'objets pour stocker uniquement les identifiants dans markersIDS
                    for (k=0; k < markers.length; k++) {
                        markersIDS.push(markers[k].id);
                    }

                    // Le jeu ne commence que si les 12 markers sont reconnus
                    if(markersIDS.length == 12 && !hasBegun) {
                        hasBegun = true;
                        document.getElementById("status").innerHTML="";
                        console.log("Beginning of the game");
                    }

                    // Le jeu est en pause si on détecte moins de 6 markers
                    if(hasBegun && markersIDS.length <= 6) {
                        hasBegun = false;
                        document.getElementById("status").innerHTML="Jeu mis en pause, veuillez replacer la caméra";
                        console.log("Game paused");
                    }

                    if(hasBegun && !updateMarkersRolling) {
                        updateMarkersRolling = true;
                        canPlay = false;

                        // On détermine les markers sélectionnables
                        if (turnOfPlayer1) {
                            turnMarkers = firstPlayerMarkers;
                            markersToEmpty = secondPlayerPoints;
                            document.getElementById("turn").innerHTML="1";
                        }
                        else {
                            turnMarkers = secondPlayerMarkers;
                            markersToEmpty = firstPlayerMarkers;
                            document.getElementById("turn").innerHTML="2";
                        }

                        // On vérifie que le joueur peut jouer, c'est-à-dire qu'il existe un grenier à graines dans sa rangée)
                        if(turnMarkers.find(checkCanPlay) == undefined) {
                            // Le joueur ne peut pas jouer, le joueur adverse récolte toutes les graines restantes
                            for(k=0; k < markersToEmpty.length; k++) {
                                id = markersToEmpty[k];
                                holeIndex = holesInOrder.indexOf(id);
                                if(seedsGlobalCounter[holeIndex] > 0) {
                                    // S'il y a des graines à récolter, on les supprime et on ajoute leur nombre au score du joueur adverse
                                    this.emit("removeSeeds",id);
                                    if(turnOfPlayer1) {
                                        firstPlayerPoints += seedsGlobalCounter[holeIndex];
                                    } else {
                                        secondPlayerPoints += seedsGlobalCounter[holeIndex];
                                    }
                                    seedsGlobalCounter[holeIndex] = 0;
                                }
                            }
                            this.displayFinalPanel();
                            this.emit("endOfGame");
                        }
                        else {

                            hasSelected = false;

                            // On parcout un à un les markers censés être détectés
                            for (k=0; k < turnMarkers.length; k++) {
                                id = turnMarkers[k];
                                holeIndex = holesInOrder.indexOf(id);

                                if(!markersIDS.includes(id)) {
                                    /* Si le marker n'a pas été identifé, c'est qu'il est caché
                                     * S'il est caché pendant plus de deux secondes, c'est qu'il est sélectionné
                                     * Ce temps de cache est stocké dans timerMarkers, la valeur -1 correspondant à l'état initial et à un marker non caché.
                                     */
                                     if (timerMarkers[id] != -1) {
                                        time = new Date().getTime();
                                        timeDiff = time - timerMarkers[id];

                                        if ((timeDiff > 2000) && (seedsGlobalCounter[holeIndex] != 0) && !hasSelected) {
                                            console.log("Je sélectionne le marker : " + id);
                                            timerMarkers[id] = -1;
                                            this.emit("selectMarker",id);
                                            hasSelected = true;
                                            turnOfPlayer1 = !turnOfPlayer1;
                                        }
                                    }
                                    else {
                                        timerMarkers[id] =  new Date().getTime();
                                    }
                                }
                                else {
                                    timerMarkers[id] = -1;
                                }
                            }

                        }
                        updateMarkersRolling = false;
                    }
                };

                /**
                 * Distribue les graines d'un grenier identifié par id
                 * aux greniers suivants dans l'ordre trigonométrique.
                 * @param seedNumber {int} nombre de graines à distribuer
                 * @param id         {id}  identifiant du grenier donneur
                 * @function GameManager#distributeSeed
                 */
                 this.distributeSeed = function (seedNumber, id) {
                    var givingHoleIndex = holesInOrder.indexOf(id);
                    var holeIndex = holesInOrder.indexOf(id);
                    var n = holesInOrder.length;
                    var i = seedNumber;
                    var newId;

                    // On initialise toutes les cases de seedsRecoltCounter à 0
                    seedsRecoltCounter.fill(0);

                    /* Tant qu'il reste des graines dans le grenier, on continue la distribution.
                     * Si on arrive à la fin de holesInOrder, on recommence au début.
                     */
                     while (i > 0) {
                        if (holeIndex == (n-1)) {
                            holeIndex = 0;
                        }
                        else {
                            holeIndex++;
                        }

                        newId = holesInOrder[holeIndex];
                        this.emit("mooveSeed",id,newId);
                        seedsGlobalCounter[holeIndex]++;
                        seedsGlobalCounter[givingHoleIndex]--;
                        i--;
                    }

                    /* On effectue maintenant la récolte en sens inverse en parcourant les greniers visités.
                     * Le nombre de graine récoltables sont stockées dans seedsRecoltCounter.
                     */
                     i = seedNumber;
                     while ((i > 0) && (seedsRecoltCounter[holeIndex] != 0)) {
                        // On supprime les graines gagnées
                        newId = holesInOrder[holeIndex];
                        seedsGlobalCounter[holeIndex] = 0;
                        this.emit("removeSeeds",newId);

                        // On ajoute le nombre de graines gagnées au score du joueur actuel
                        if(turnOfPlayer1) {
                            firstPlayerPoints += seedsRecoltCounter[holeIndex];
                        }
                        else {
                            secondPlayerPoints += seedsRecoltCounter[holeIndex];
                        }

                        // On actualise l'index
                        if (holeIndex == 0) {
                            holeIndex = (n-1);
                        }
                        else {
                            holeIndex--;
                        }

                        i--;
                    }

                    // On affiche les scores sur la page HTML
                    document.getElementById("score1").innerHTML = firstPlayerPoints;
                    document.getElementById("score2").innerHTML = secondPlayerPoints;

                    seedsRecoltCounter.fill(0);


                };

                /**
                 * Envoie la graine recçue à l'identifiant reçu grâce à 'sendSeed'.
                 * @param idToGive {int} identifiant du grenier qui va reçevoir la graine
                 * @param obj      {object} un Three.js Object3D représentant la graine à donner
                 * @function GameManager#getSeedToSend
                 */
                 this.getSeedToSend = function(idToGive,obj) {
                    this.emit("sendSeed",idToGive,obj);

                };

                /**
                 * Fonction appelée à chaque visite d'un grenier. Permet de déterminer
                 * si les graines de ce grenier seront récoltables ou non (2 ou 3 graines
                 * après visite + grenier de l'autre joueur). Si les graines sont
                 * récoltables, on stocke leur nombre dans seedsRecoltCounter.
                 * @param id {int} identifiant du grenier
                 * @param seedNumber {int} nombre de graine du grenier
                 * @function GameManager#updateSeedsRecoltCounter
                 */
                 this.updateSeedsRecoltCounter = function(id,seedNumber) {
                    var cond1 = (turnOfPlayer1 && secondPlayerMarkers.includes(id));
                    var cond2 = (!turnOfPlayer1 && firstPlayerMarkers.includes(id));
                    var index;
                    if ( cond1 || cond2 ) {
                        if(seedNumber == 2 || seedNumber == 3) {
                            index = holesInOrder.indexOf(id);
                            seedsRecoltCounter[index] = seedNumber;
                        }
                    }
                };

                this.displayFinalPanel = function() {
                    console.log("End of game");
                    document.getElementById("instruction").innerHTML="";
                    if(firstPlayerPoints>secondPlayerPoints){
                        document.getElementById("winner").innerHTML="Le joueur 1 a gagné !";
                    }
                    else{
                        document.getElementById("winner").innerHTML="Le joueur 2 a gagné !";
                    }
                };

            },
            ['distributeSeed', 'updateMarkers', 'getSeedToSend', 'updateSeedsRecoltCounter', 'displayFinalPanel'],
            ['selectMarker', 'mooveSeed', 'sendSeed', 'removeSeeds', 'endOfGame']
            );



return { GameManager : GameManager };
},
[ "deps/three.js/index" ]
);
