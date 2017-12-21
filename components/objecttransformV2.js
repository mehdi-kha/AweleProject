arcs_module(
    function(ARCS,_three) {
        var ObjectTransform ;

        /**
         * @class ObjectTransform
         * @classdesc Apply transformations to objects
         */
         ObjectTransform = ARCS.Component.create(
            function() {
                var objRoot;
                var objParent;

                var refMat;
                var id = -1;

                var seedNumber = 0; // nombre de graines du grenier

                /**
                 * Sets the object of interest on which we would like to apply transforms.
                 * Used only on first load.
                 * @param obj {object} a Three.js Object3D
                 * @function ObjectTransformV2#setObject
                 */
                this.setObject = function (obj) {
                    // Création du graphe de scène
                    objRoot = new THREE.Object3D();
                    objParent = obj.parent;
                    objParent.add(objRoot);
                    objParent.remove(obj);

                    // Les graines sont placées sur un quadrillage 4x4 en fonction de leur nombre
                    obj.position.x = -0.02;
                    obj.position.y = 0.02;
                    obj.name = "seed_" + seedNumber;
                    objRoot.add(obj);

                    var box = new THREE.Box3;
                    box.setFromObject(obj);
                    var s = box.size();
                    var scale = MAX3(s.x, s.y, s.z);
                    console.log(scale);
                    obj.add(new THREE.AxisHelper(scale / 2));

                    seedNumber += 1;
                };

                /**
                 * Ajout d'un objet au graphe de scène.
                 * Utilisé en dehors de l'initialisation.
                 * @param obj {object} un Three.js Object3D
                 * @function ObjectTransformV2#addObject
                 */
                this.addObject = function (obj) {
                    // On supprime le parent de l'objet
                    obj.parent.remove(obj);
                    // On détermine la position de la graine sur la grille
                    switch (seedNumber) {
                        case 0:
                        obj.position.x = -0.02;
                        obj.position.y = 0.02;
                        break;
                        case 1:
                        obj.position.x = -0.007;
                        obj.position.y = 0.02;
                        break;
                        case 2:
                        obj.position.x = 0.007;
                        obj.position.y = 0.02;
                        break;
                        case 3:
                        obj.position.x = 0.02;
                        obj.position.y = 0.02;
                        break;
                        case 4:
                        obj.position.x = -0.02;
                        obj.position.y = 0.007;
                        break;
                        case 5:
                        obj.position.x = -0.007;
                        obj.position.y = 0.007;
                        break;
                        case 6:
                        obj.position.x = 0.007;
                        obj.position.y = 0.007;
                        break;
                        case 7:
                        obj.position.x = 0.02;
                        obj.position.y = 0.007;
                        break;
                        case 8:
                        obj.position.x = -0.02;
                        obj.position.y = -0.007;
                        break;
                        case 9:
                        obj.position.x = -0.007;
                        obj.position.y = -0.007;
                        break;
                        case 10:
                        obj.position.x = 0.007;
                        obj.position.y = -0.007;
                        break;
                        case 11:
                        obj.position.x = 0.02;
                        obj.position.y = -0.007;
                        break;
                        case 12:
                        obj.position.x = -0.02;
                        obj.position.y = 0.007;
                        break;
                        case 13:
                        obj.position.x = -0.007;
                        obj.position.y = 0.007;
                        break;
                        case 14:
                        obj.position.x = 0.007;
                        obj.position.y = 0.02;
                        break;
                        case 15:
                        obj.position.x = 0.02;
                        obj.position.y = 0.02;
                        break;
                        default:
                        console.log("ERROR : calcul de position incorrect");
                        break;
                    }

                    obj.name = "seed_" + seedNumber;
                    objRoot.add(obj);

                    var box = new THREE.Box3;
                    box.setFromObject(obj);
                    var s = box.size();
                    var scale = MAX3(s.x, s.y, s.z);
                    obj.add(new THREE.AxisHelper(scale / 2));

                    seedNumber += 1;
                };

                this.addBoard = function (obj) {


                    objRoot = new THREE.Object3D();
                    objParent = obj.parent;
                    objParent.add(objRoot);
                    objParent.remove(obj);

                    obj.position.x = -0.032;
                    obj.position.y = -0.16;
                    obj.position.z = -0.43;
                    //obj.material.uniforms.transparent = true;
                    //obj.material.uniforms.opacity = 0.3;
                    console.log(obj);
                    obj.name = "board";

                    console.log(obj.position);
                    console.log(obj.name);

                    objRoot.add(obj);

                    var box = new THREE.Box3;
                    box.setFromObject(obj);
                    var s = box.size();
                    var scale = MAX3(s.x, s.y, s.z);
                    console.log(scale);
                    obj.add(new THREE.AxisHelper(scale / 2));

                    //console.log(seedNumber);
                };

                var MAX3 = function (a,b,c) {
                    if ( a >= b ) {
                     if ( a >= c) {
                         return a;
                     } else {
                         return c;
                     }
                 } else {
                     if (b >= c) {
                         return b;
                     } else {
                         return c;
                     }
                 }
             };

                // right now, we make something compatible with aruco markers
                // it may evolve in the future

                /**
                 * Takes an array of markers and then applies transformations
                 * to the referenced object.
                 * @function ObjectTransformV2#setTransform
                 * @param arr {array} an array of detected markers.
                 */
                 this.setTransform = function ( arr ) {
                    /*2 set here the transformation we should apply on objRoot
                     *  Each marker has 3 major properties :
                     *  - id is the marker id;
                     *  - pose.rotation gives its orientation using a rotation matrix
                     *    and is a 3x3 array
                     *  - pose.position gives its position with respect to the camera
                     *    and is a vector with 3 components.
                     */
                     if (objRoot === undefined) { return ; }
                     var i ;
                     for ( i = 0; i < arr.length; i++) {
                        if ( arr[i].id === id ) {
                            // insert your code here to modify objRoot

                            var matrixMarker = new THREE.Matrix4();

                            matrixMarker.set(arr[i].pose.rotation[0][0], arr[i].pose.rotation[0][1], arr[i].pose.rotation[0][2],arr[i].pose.position[0], arr[i].pose.rotation[1][0], arr[i].pose.rotation[1][1],arr[i].pose.rotation[1][2],arr[i].pose.position[1], arr[i].pose.rotation[2][0], arr[i].pose.rotation[2][1], arr[i].pose.rotation[2][2], arr[i].pose.position[2],0,0,0,1);


                            matrixMarker.decompose(objRoot.position, objRoot.rotation, objRoot.scale);

                        }
                    }
                };

// right now, we make something compatible with aruco markers
                // it may evolve in the future

                /**
                 * Takes an array of markers and then applies transformations
                 * to the referenced object.
                 * @function ObjectTransform#setTransform
                 * @param arr {array} an array of detected markers.
                 */
                 this.setTransform2 = function ( arr ) {
                    /*2 set here the transformation we should apply on objRoot
                     *  Each marker has 3 major properties :
                     *  - id is the marker id;
                     *  - pose.rotation gives its orientation using a rotation matrix
                     *    and is a 3x3 array
                     *  - pose.position gives its position with respect to the camera
                     *    and is a vector with 3 components.
                     */
                     if (objRoot === undefined) { return ; }
                     var i ;
                     for ( i = 0; i < arr.length; i++) {
                        if ( arr[i].id === id ) {
                            // insert your code here to modify objRoot

                            var matrixMarker = new THREE.Matrix4();
                            var diffx = objRoot.position.x - arr[i].pose.position[0];
                            var diffy = objRoot.position.y - arr[i].pose.position[1];
                            if(Math.abs(diffx)>0.003 || Math.abs(diffy)>0.001){

                                matrixMarker.set(arr[i].pose.rotation[0][0], arr[i].pose.rotation[0][1], arr[i].pose.rotation[0][2],arr[i].pose.position[0], arr[i].pose.rotation[1][0], arr[i].pose.rotation[1][1],arr[i].pose.rotation[1][2],arr[i].pose.position[1], arr[i].pose.rotation[2][0], arr[i].pose.rotation[2][1], arr[i].pose.rotation[2][2], arr[i].pose.position[2],0,0,0,1);


                                matrixMarker.decompose(objRoot.position, objRoot.rotation, objRoot.scale);
                            }

                        }
                    }
                };


                this.setId = function (i) {
                    id = i;
                };

                /**
                 * Emet le signal 'sendSeednumber' avec son identifiant et son nombre de graines
                 * si l'idendifiant reçu correspond au sien.
                 * @param selectedId {int} identifiant sélectionné
                 * @function ObjectTransformV2#isSelected
                 */
                this.isSelected = function (selectedId) {
                    if(id == selectedId) {
                        this.emit("sendSeedNumber",seedNumber,id);
                    }
                };

                /**
                 * Supprime une graine de son graphe et envoie l'objet correspondant à une autre instance
                 * si l'idendifiant reçu correspond au sien.
                 * @param selectedId {int} identifiant sélectionné
                 * @param idToGive   {int} identifiant à qui la graine doit être donnée
                 * @function ObjectTransformV2#giveOneSeed
                 */
                this.giveOneSeed = function(selectedId,idToGive) {
                    if(id == selectedId) {
                        // On récupère la dernière graine ajoutée
                        var seedName = "seed_" + (seedNumber-1);
                        var selectedSeed = objRoot.getObjectByName(seedName);

                        // On supprime le lien entre objRoot et l'objet et on donne cette graine à l'autre grenier
                        objRoot.remove(selectedSeed);
                        seedNumber -= 1;

                        var newParent = new THREE.Object3D();
                        newParent.add(selectedSeed);

                        this.emit("seedToSend",idToGive,selectedSeed);
                    }
                };

                /**
                 * Ajoute la graine reçue si l'idendifiant reçu correspond au sien.
                 * Emet le signal 'seedAdded' après l'ajout et envoie son id et le nombre de graines.
                 * @param selectedId {int} identifiant sélectionné
                 * @param obj        {object} un Three.js Object3D représentant une graine
                 * @function ObjectTransformV2#addSeed
                 */
                this.addSeed = function(selectedId, obj) {
                    if(id == selectedId) {
                        this.addObject(obj);
                        this.emit('seedAdded',id,seedNumber);
                    }
                };

                /**
                 * Supprime toutes les graines du grenier si l'identifiant reçu correspond au sien.
                 * @param selectedId {int} identifiant sélectionné
                 * @function ObjectTransformV2#deleteSeeds
                 */
                this.deleteSeeds = function(selectedId) {
                    var seedName, selectedSeed;
                    if(id == selectedId) {
                        console.log("Deleting seeds of : " + id);

                        while(seedNumber > 0) {
                            console.log("Deletion of seed number " + (seedNumber-1));
                            seedName = "seed_" + (seedNumber-1);

                            selectedSeed = objRoot.getObjectByName(seedName);
                            objRoot.remove(selectedSeed);

                            seedNumber--;
                        }
                    }
                };


            },
            ['setObject', 'addObject', 'setTransform', 'setTransform2', 'setId', 'isSelected', 'giveOneSeed', 'addSeed', 'deleteSeeds'],
            ['sendSeedNumber', 'seedToSend', 'seedAdded']
        );


return { ObjectTransform : ObjectTransform };
},
[ "deps/three.js/index" ]
);
