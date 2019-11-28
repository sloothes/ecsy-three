(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ecsy'), require('three'), require('three/examples/jsm/loaders/GLTFLoader.js'), require('three/examples/jsm/vr/WebVR.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'ecsy', 'three', 'three/examples/jsm/loaders/GLTFLoader.js', 'three/examples/jsm/vr/WebVR.js'], factory) :
	(global = global || self, (function () {
		var current = global.ECSYTHREE;
		var exports = global.ECSYTHREE = {};
		factory(exports, global.ECSY, global.THREE, global.GLTFLoader_js, global.WebVR_js);
		exports.noConflict = function () { global.ECSYTHREE = current; return exports; };
	}()));
}(this, (function (exports, ECSY, THREE, GLTFLoader_js, WebVR_js) { 'use strict';

	class Scene {
	  constructor() {
	    this.scene = null;
	  }

	  reset() {
	    this.scene = null;
	  }
	}

	class Parent {
	  constructor() {
	    this.value = null;
	  }

	  reset() {
	    this.value = null;
	  }
	}

	class SkyBox {
	  constructor() {
	    this.texture = '';
	    this.type = '';
	  }
	  reset() {
	    this.texture = '';
	    this.type = '';
	  }
	}

	class Object3D {
	  constructor() {
	    this.value = null;
	  }

	  reset() {
	    this.value = null;
	  }
	}

	class Visible {
	  constructor() {
	    this.reset();
	  }

	  reset() {
	    this.value = false;
	  }
	}

	class CameraRig {
	  constructor() {
	    this.reset();
	  }

	  reset() {
	    this.leftHand = null;
	    this.rightHand = null;
	    this.camera = null;
	  }
	}

	class Draggable {
	  constructor() {
	    this.reset();
	  }

	  reset() {
	    this.value = false;
	  }
	}

	class Dragging extends ECSY.TagComponent {}

	class Active {
	  constructor() {
	    this.reset();
	  }

	  reset() {
	    this.value = false;
	  }
	}

	class Transform {
	  constructor() {
	    this.position = new THREE.Vector3();
	    this.rotation = new THREE.Vector3();
	  }

	  copy(src) {
	    this.position.copy(src.position);
	    this.rotation.copy(src.rotation);
	  }

	  reset() {
	    this.position.set(0, 0, 0);
	    this.rotation.set(0, 0, 0);
	  }
	}

	class Geometry {
	  constructor() {
	    this.primitive = "box";
	  }

	  reset() {
	    this.primitive = "box";
	  }
	}

	class GLTFModel {}

	class TextGeometry {
	  reset() {}
	}

	class VRController {
	  constructor() {
	    this.id = 0;
	    this.controller = null;
	  }
	  reset() {}
	}

	class Material {
	  constructor() {
	    this.color = 0xff0000;
	  }
	}

	class Sky {
	  constructor() {}
	  reset() {}
	}

	const Camera = ECSY.createComponentClass({
	  fov: { default: 45 },
	  aspect: { default: 1 },
	  near: { default: 1 },
	  far: { default: 1000 },
	  layers: { default: 0 },
	  handleResize: { default: true }
	}, "Camera");


	const WebGLRenderer = ECSY.createComponentClass({
	  vr: { default: true },
	  antialias: {default: true},
	  handleResize: { default: true }
	}, "WebGLRenderer");

	class RenderableGroup {
	  constructor() {
	    this.scene = null;
	    this.camera = null;
	  }

	  reset() {
	    this.scene = null;
	    this.camera = null;
	  }
	}

	/* global THREE */

	/**
	 * Create a Mesh based on the [Geometry] component and attach it to the entity using a [Object3D] component
	 */
	class GeometrySystem extends ECSY.System {
	  execute() {
	    // Removed
	    this.queries.entities.removed.forEach(entity => {
	      /*
	      let object = entity.getRemovedComponent(Object3D).value;
	      let parent = entity.getComponent(Parent, true).value;
	      parent.getComponent(Object3D).value.remove(object);
	      */
	    });

	    // Added
	    this.queries.entities.added.forEach(entity => {
	      let component = entity.getComponent(Geometry);

	      let geometry;
	      switch (component.primitive) {
	        case "torus":
	          {
	            geometry = new THREE.TorusBufferGeometry(
	              component.radius,
	              component.tube,
	              component.radialSegments,
	              component.tubularSegments
	            );
	          }
	          break;
	        case "sphere":
	          {
	            geometry = new THREE.IcosahedronBufferGeometry(component.radius, 1);
	          }
	          break;
	        case "box":
	          {
	            geometry = new THREE.BoxBufferGeometry(
	              component.width,
	              component.height,
	              component.depth
	            );
	          }
	          break;
	      }

	      let color =
	        component.primitive === "torus" ? 0x999900 : Math.random() * 0xffffff;

	      let material = new THREE.MeshStandardMaterial({
	        color: color,
	        roughness: 0.7,
	        metalness: 0.0,
	        flatShading: true
	      });

	      let object = new THREE.Mesh(geometry, material);
	      object.castShadow = true;
	      object.receiveShadow = true;

	      if (entity.hasComponent(Transform)) {
	        let transform = entity.getComponent(Transform);
	        object.position.copy(transform.position);
	        if (transform.rotation) {
	          object.rotation.set(
	            transform.rotation.x,
	            transform.rotation.y,
	            transform.rotation.z
	          );
	        }
	      }

	//      if (entity.hasComponent(Element) && !entity.hasComponent(Draggable)) {
	//        object.material.color.set(0x333333);
	//      }

	      entity.addComponent(Object3D, { value: object });

	      // @todo Remove it! hierarchy system will take care of it
	      if (entity.hasComponent(Parent)) {
	        entity.getComponent(Parent).value.getComponent(Object3D).value.add(object);
	      }
	    });
	  }
	}

	GeometrySystem.queries = {
	  entities: {
	    components: [Geometry], // @todo Transform: As optional, how to define it?
	    listen: {
	      added: true,
	      removed: true
	    }
	  }
	};

	// @todo Use parameter and loader manager
	var loader = new GLTFLoader_js.GLTFLoader().setPath("/assets/");

	class GLTFLoaderSystem extends ECSY.System {
	  execute() {
	    var entities = this.queries.entities.added;

	    //Queries
	    for (let i = 0; i < entities.length; i++) {
	      var entity = entities[i];
	      var component = entity.getComponent(GLTFModel);

	      loader.load(component.url, gltf => {
	        /*
	        gltf.scene.traverse(function(child) {
	          if (child.isMesh) {
	            child.material.envMap = envMap;
	          }
	        });
	*/
	        // @todo Remove, hierarchy will take care of it
	        if (entity.hasComponent(Parent)) {
	          entity.getComponent(Parent).value.add(gltf.scene);
	        }
	        entity.addComponent(Object3D, { value: gltf.scene });
	      });
	    }
	  }
	}

	GLTFLoaderSystem.queries = {
	  entities: {
	    components: [GLTFModel],
	    listen: {
	      added: true
	    }
	  }
	};

	class SkyBoxSystem extends ECSY.System {
	  execute() {
	    let entities = this.queries.entities.results;
	    for (var i = 0; i < entities.length; i++) {
	      var entity = entities[i];

	      var skybox = entity.getComponent(SkyBox);

	      var group = new THREE.Group();
	      var geometry = new THREE.BoxBufferGeometry( 100, 100, 100 );
	      geometry.scale( 1, 1, - 1 );

	      if (skybox.type === 'cubemap-stereo') {
	        var textures = getTexturesFromAtlasFile( skybox.textureUrl, 12 );

	        var materials = [];

	        for ( var i = 0; i < 6; i ++ ) {
	  
	          materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
	  
	        }
	  
	        var skyBox = new THREE.Mesh( geometry, materials );
	        skyBox.layers.set( 1 );
	        group.add(skyBox);
	  
	        var materialsR = [];
	  
	        for ( var i = 6; i < 12; i ++ ) {
	  
	          materialsR.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
	  
	        }
	  
	        var skyBoxR = new THREE.Mesh( geometry, materialsR );
	        skyBoxR.layers.set( 2 );
	        group.add(skyBoxR);

	        entity.addComponent(Object3D, { value: group });
	      } else {
	        console.warn('Unknown skybox type: ', skybox.type);
	      }

	    }
	  }
	}


	function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {

	  var textures = [];

	  for ( var i = 0; i < tilesNum; i ++ ) {

	    textures[ i ] = new THREE.Texture();

	  }

	  var loader = new THREE.ImageLoader();
	  loader.load( atlasImgUrl, function ( imageObj ) {

	    var canvas, context;
	    var tileWidth = imageObj.height;

	    for ( var i = 0; i < textures.length; i ++ ) {

	      canvas = document.createElement( 'canvas' );
	      context = canvas.getContext( '2d' );
	      canvas.height = tileWidth;
	      canvas.width = tileWidth;
	      context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
	      textures[ i ].image = canvas;
	      textures[ i ].needsUpdate = true;

	    }

	  } );

	  return textures;

	}

	SkyBoxSystem.queries = {
	  entities: {
	    components: [SkyBox, ECSY.Not(Object3D)]
	  }
	};

	class VisibilitySystem extends ECSY.System {
	  processVisibility(entities) {
	    entities.forEach(entity => {
	      entity.getMutableComponent(Object3D).value.visible = entity.getComponent(
	        Visible
	      ).value;
	    });
	  }

	  execute() {
	    this.processVisibility(this.queries.entities.added);
	    this.processVisibility(this.queries.entities.changed);
	  }
	}

	VisibilitySystem.queries = {
	  entities: {
	    components: [Visible, Object3D],
	    listen: {
	      added: true,
	      changed: [Visible]
	    }
	  }
	};

	class WebGLRendererContext {
	  constructor() {
	    this.renderer = null;
	  }
	}

	class WebGLRendererSystem extends ECSY.System {
	  init() {
	    window.addEventListener(
	      "resize",
	      () => {
	        this.queries.renderers.results.forEach(entity => {
	          var component = entity.getMutableComponent(WebGLRenderer);
	          component.width = window.innerWidth;
	          component.height = window.innerHeight;
	        });
	      },
	      false
	    );
	  }

	  execute(delta) {
	    // Uninitialized renderers
	    this.queries.uninitializedRenderers.results.forEach(entity => {
	      var component = entity.getComponent(WebGLRenderer);

	      var renderer = new THREE.WebGLRenderer({antialias: component.antialias});

	      renderer.setPixelRatio( window.devicePixelRatio );
	      if (component.handleResize) {
					renderer.setSize( window.innerWidth, window.innerHeight );
	      }

	      document.body.appendChild( renderer.domElement );

	      if (component.vr) {
	        renderer.vr.enabled = true;
	        document.body.appendChild( WebVR_js.WEBVR.createButton( renderer, { referenceSpaceType: 'local' } ) );
	      }

	      entity.addComponent(WebGLRendererContext, {renderer: renderer});
	    });

	    this.queries.renderers.changed.forEach(entity => {
	      var component = entity.getComponent(WebGLRenderer);
	      var renderer = entity.getComponent(WebGLRendererContext).renderer;
	      if (component.width !== renderer.width || component.height !== renderer.height) {
	        renderer.setSize( component.width, component.height );
	        // innerWidth/innerHeight
	      }
	    });

	    let renderers = this.queries.renderers.results;
	    renderers.forEach(rendererEntity => {
	      var renderer = rendererEntity.getComponent(WebGLRendererContext).renderer;
	      this.queries.renderables.results.forEach(entity => {
	        var group = entity.getComponent(RenderableGroup);
	        var scene = group.scene.getComponent(Object3D).value;
	        var camera = group.camera.getComponent(Object3D).value;
	        renderer.render(scene, camera);
	      });
	    });
	  }
	}


	WebGLRendererSystem.queries = {
	  uninitializedRenderers: {
	    components: [WebGLRenderer, ECSY.Not(WebGLRendererContext)],
	  },
	  renderers: {
	    components: [WebGLRenderer, WebGLRendererContext],
	    listen: {
	      changed: [WebGLRenderer]
	    }
	  },
	  renderables: {
	    components: [RenderableGroup]
	  }
	};

	class TransformSystem extends ECSY.System {
	  execute(delta) {
	    // Hierarchy
	    let added = this.queries.parent.added;
	    for (var i = 0; i < added.length; i++) {
	      var entity = added[i];
	      console.log('Adding', i);
	      var parentEntity = entity.getComponent(Parent).value;
	      parentEntity.getComponent(Object3D).value.add(entity.getComponent(Object3D).value);
	    }
	  }
	}

	TransformSystem.queries = {
	  parent: {
	    components: [Parent, Object3D],
	    listen: {
	      added: true
	    }
	  }
	};

	class CameraSystem extends ECSY.System {
	  init() {
	    window.addEventListener( 'resize', () => {
	      this.queries.cameras.results.forEach(camera => {
	        var component = camera.getComponent(Camera);
	        if (component.handleResize) {
	          camera.getMutableComponent(Camera).aspect = window.innerWidth / window.innerHeight;
	          console.log('Aspect updated');
	        }
	      });
	    }, false );
	  }

	  execute(delta) {
	    let changed = this.queries.cameras.changed;
	    for (var i = 0; i < changed.length; i++) {
	      var entity = changed[i];

	      var component = entity.getComponent(Camera);
	      var camera3d = entity.getMutableComponent(Object3D).value;

	      if (camera3d.aspect !== component.aspect) {
	        console.log('Camera Updated');

	        camera3d.aspect = component.aspect;
	        camera3d.updateProjectionMatrix();
	      }
	      // @todo Do it for the rest of the values
	    }


	    let camerasUninitialized = this.queries.camerasUninitialized.results;
	    for (var i = 0; i < camerasUninitialized.length; i++) {
	      var entity = camerasUninitialized[i];

	      var component = entity.getComponent(Camera);

	      var camera = new THREE.PerspectiveCamera(
	        component.fov,
	        component.aspect,
	        component.near,
	        component.far );

	      camera.layers.enable( component.layers );

	      entity.addComponent(Object3D, { value: camera });
	    }
	  }
	}

	CameraSystem.queries = {
	  camerasUninitialized: {
	    components: [Camera, ECSY.Not(Object3D)]
	  },
	  cameras: {
	    components: [Camera, Object3D],
	    listen: {
	      changed: [Camera]
	    }
	  }
	};

	/* global THREE */

	class TextGeometrySystem extends ECSY.System {
	  init() {
	    this.initialized = false;
	    var loader = new THREE.FontLoader();
	    this.font = null;
	    loader.load("/assets/fonts/helvetiker_regular.typeface.json", font => {
	      this.font = font;
	      this.initialized = true;
	    });
	  }

	  execute() {
	    if (!this.font) return;

	    var changed = this.queries.entities.changed;
	    changed.forEach(entity => {
	      var textComponent = entity.getComponent(TextGeometry);
	      var geometry = new THREE.TextGeometry(textComponent.text, {
	        font: this.font,
	        size: 1,
	        height: 0.1,
	        curveSegments: 3,
	        bevelEnabled: true,
	        bevelThickness: 0.03,
	        bevelSize: 0.03,
	        bevelOffset: 0,
	        bevelSegments: 3
	      });
	      var object = entity.getMutableComponent(Object3D).value;
	      object.geometry = geometry;
	    });

	    var added = this.queries.entities.added;
	    added.forEach(entity => {
	      var textComponent = entity.getComponent(TextGeometry);
	      var geometry = new THREE.TextGeometry(textComponent.text, {
	        font: this.font,
	        size: 1,
	        height: 0.1,
	        curveSegments: 3,
	        bevelEnabled: true,
	        bevelThickness: 0.03,
	        bevelSize: 0.03,
	        bevelOffset: 0,
	        bevelSegments: 3
	      });

	      var color = Math.random() * 0xffffff;
	      color = 0xffffff;
	      var material = new THREE.MeshStandardMaterial({
	        color: color,
	        roughness: 0.7,
	        metalness: 0.0
	      });

	      var mesh = new THREE.Mesh(geometry, material);

	      entity.addComponent(Object3D, { value: mesh });
	    });
	  }
	}

	TextGeometrySystem.queries = {
	  entities: {
	    components: [TextGeometry],
	    listen: {
	      added: true,
	      changed: true
	    }
	  }
	};

	function init(world) {
	  world
	    .registerSystem(TransformSystem)
	    .registerSystem(CameraSystem)
	    .registerSystem(WebGLRendererSystem, {priority: 1});
	}

	function initializeDefault(world = new ECSY.World()) {
	  init(world);

	  let scene = world.createEntity().addComponent(Object3D /* Scene */, {value: new THREE.Scene()});
	  let renderer = world.createEntity().addComponent(WebGLRenderer);
	  let camera = world.createEntity().addComponent(Camera, {
	    fov: 90,
	    aspect: window.innerWidth / window.innerHeight,
	    near: 1,
	    far: 1000,
	    layers: 1,
	    handleResize: true
	  });

	  let renderables = world.createEntity().addComponent(RenderableGroup, {
	    scene: scene,
	    camera: camera
	  });

	  return {
	    world,
	    entities: {
	      scene,
	      camera,
	      renderer,
	      renderables
	    }
	  };
	}

	exports.Active = Active;
	exports.Camera = Camera;
	exports.CameraRig = CameraRig;
	exports.CameraSystem = CameraSystem;
	exports.Draggable = Draggable;
	exports.Dragging = Dragging;
	exports.GLTFLoaderSystem = GLTFLoaderSystem;
	exports.GLTFModel = GLTFModel;
	exports.Geometry = Geometry;
	exports.GeometrySystem = GeometrySystem;
	exports.Material = Material;
	exports.Object3D = Object3D;
	exports.Parent = Parent;
	exports.Scene = Scene;
	exports.Sky = Sky;
	exports.SkyBox = SkyBox;
	exports.SkyBoxSystem = SkyBoxSystem;
	exports.TextGeometry = TextGeometry;
	exports.TextGeometrySystem = TextGeometrySystem;
	exports.Transform = Transform;
	exports.TransformSystem = TransformSystem;
	exports.VRController = VRController;
	exports.VisibilitySystem = VisibilitySystem;
	exports.Visible = Visible;
	exports.WebGLRendererSystem = WebGLRendererSystem;
	exports.init = init;
	exports.initializeDefault = initializeDefault;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzeS10aHJlZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudHMvU2NlbmUuanMiLCIuLi9zcmMvY29tcG9uZW50cy9QYXJlbnQuanMiLCIuLi9zcmMvY29tcG9uZW50cy9Ta3lib3guanMiLCIuLi9zcmMvY29tcG9uZW50cy9PYmplY3QzRC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1Zpc2libGUuanMiLCIuLi9zcmMvY29tcG9uZW50cy9DYW1lcmFSaWcuanMiLCIuLi9zcmMvY29tcG9uZW50cy9EcmFnZ2FibGUuanMiLCIuLi9zcmMvY29tcG9uZW50cy9EcmFnZ2luZy5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0FjdGl2ZS5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyYW5zZm9ybS5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0dlb21ldHJ5LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvR0xURk1vZGVsLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVGV4dEdlb21ldHJ5LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVlJDb250cm9sbGVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvTWF0ZXJpYWwuanMiLCIuLi9zcmMvY29tcG9uZW50cy9Ta3kuanMiLCIuLi9zcmMvY29tcG9uZW50cy9pbmRleC5qcyIsIi4uL3NyYy9zeXN0ZW1zL0dlb21ldHJ5U3lzdGVtLmpzIiwiLi4vc3JjL3N5c3RlbXMvR0xURkxvYWRlclN5c3RlbS5qcyIsIi4uL3NyYy9zeXN0ZW1zL1NreUJveFN5c3RlbS5qcyIsIi4uL3NyYy9zeXN0ZW1zL1Zpc2liaWxpdHlTeXN0ZW0uanMiLCIuLi9zcmMvc3lzdGVtcy9XZWJHTFJlbmRlcmVyU3lzdGVtLmpzIiwiLi4vc3JjL3N5c3RlbXMvVHJhbnNmb3JtU3lzdGVtLmpzIiwiLi4vc3JjL3N5c3RlbXMvQ2FtZXJhU3lzdGVtLmpzIiwiLi4vc3JjL3N5c3RlbXMvVGV4dEdlb21ldHJ5U3lzdGVtLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBTY2VuZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2NlbmUgPSBudWxsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBQYXJlbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU2t5Qm94IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50ZXh0dXJlID0gJyc7XG4gICAgdGhpcy50eXBlID0gJyc7XG4gIH1cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy50ZXh0dXJlID0gJyc7XG4gICAgdGhpcy50eXBlID0gJyc7XG4gIH1cbn0iLCJleHBvcnQgY2xhc3MgT2JqZWN0M0Qge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgVmlzaWJsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcbiAgfVxufVxuXG4iLCJleHBvcnQgY2xhc3MgQ2FtZXJhUmlnIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sZWZ0SGFuZCA9IG51bGw7XG4gICAgdGhpcy5yaWdodEhhbmQgPSBudWxsO1xuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIERyYWdnYWJsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBUYWdDb21wb25lbnQgfSBmcm9tIFwiZWNzeVwiO1xuZXhwb3J0IGNsYXNzIERyYWdnaW5nIGV4dGVuZHMgVGFnQ29tcG9uZW50IHt9XG4iLCJleHBvcnQgY2xhc3MgQWN0aXZlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xuICB9XG59XG5cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIH1cblxuICBjb3B5KHNyYykge1xuICAgIHRoaXMucG9zaXRpb24uY29weShzcmMucG9zaXRpb24pO1xuICAgIHRoaXMucm90YXRpb24uY29weShzcmMucm90YXRpb24pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXQoMCwgMCwgMCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHZW9tZXRyeSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJpbWl0aXZlID0gXCJib3hcIjtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMucHJpbWl0aXZlID0gXCJib3hcIjtcbiAgfVxufSIsImV4cG9ydCBjbGFzcyBHTFRGTW9kZWwge31cbiIsImV4cG9ydCBjbGFzcyBUZXh0R2VvbWV0cnkge1xuICByZXNldCgpIHt9XG59XG4iLCJleHBvcnQgY2xhc3MgVlJDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pZCA9IDA7XG4gICAgdGhpcy5jb250cm9sbGVyID0gbnVsbDtcbiAgfVxuICByZXNldCgpIHt9XG59XG4iLCJleHBvcnQgY2xhc3MgTWF0ZXJpYWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbG9yID0gMHhmZjAwMDA7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTa3kge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIHJlc2V0KCkge31cbn1cbiIsImltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudENsYXNzIH0gZnJvbSBcImVjc3lcIjtcblxuZXhwb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZS5qc1wiO1xuZXhwb3J0IHsgUGFyZW50wqB9IGZyb20gXCIuL1BhcmVudC5qc1wiO1xuZXhwb3J0IHsgU2t5Qm94IH0gZnJvbSBcIi4vU2t5Ym94LmpzXCI7XG5leHBvcnQgeyBPYmplY3QzRCB9IGZyb20gXCIuL09iamVjdDNELmpzXCI7XG5leHBvcnQgeyBWaXNpYmxlIH0gZnJvbSBcIi4vVmlzaWJsZS5qc1wiO1xuZXhwb3J0IHsgQ2FtZXJhUmlnIH0gZnJvbSBcIi4vQ2FtZXJhUmlnLmpzXCI7XG5leHBvcnQgeyBEcmFnZ2FibGUgfSBmcm9tIFwiLi9EcmFnZ2FibGUuanNcIjtcbmV4cG9ydCB7IERyYWdnaW5nIH0gZnJvbSBcIi4vRHJhZ2dpbmcuanNcIjtcbmV4cG9ydCB7IEFjdGl2ZSB9IGZyb20gXCIuL0FjdGl2ZS5qc1wiO1xuZXhwb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSBcIi4vVHJhbnNmb3JtLmpzXCI7XG5leHBvcnQgeyBHZW9tZXRyeSB9IGZyb20gXCIuL0dlb21ldHJ5LmpzXCI7XG5leHBvcnQgeyBHTFRGTW9kZWwgfSBmcm9tIFwiLi9HTFRGTW9kZWwuanNcIjtcbmV4cG9ydCB7IFRleHRHZW9tZXRyeSB9IGZyb20gXCIuL1RleHRHZW9tZXRyeS5qc1wiO1xuZXhwb3J0IHsgVlJDb250cm9sbGVyIH0gZnJvbSBcIi4vVlJDb250cm9sbGVyLmpzXCI7XG5leHBvcnQgeyBNYXRlcmlhbCB9IGZyb20gXCIuL01hdGVyaWFsLmpzXCI7XG5leHBvcnQgeyBTa3kgfSBmcm9tIFwiLi9Ta3kuanNcIjtcblxuZXhwb3J0IGNvbnN0IENhbWVyYSA9IGNyZWF0ZUNvbXBvbmVudENsYXNzKHtcbiAgZm92OiB7IGRlZmF1bHQ6IDQ1IH0sXG4gIGFzcGVjdDogeyBkZWZhdWx0OiAxIH0sXG4gIG5lYXI6IHsgZGVmYXVsdDogMSB9LFxuICBmYXI6IHsgZGVmYXVsdDogMTAwMCB9LFxuICBsYXllcnM6IHsgZGVmYXVsdDogMCB9LFxuICBoYW5kbGVSZXNpemU6IHsgZGVmYXVsdDogdHJ1ZSB9XG59LCBcIkNhbWVyYVwiKTtcblxuXG5leHBvcnQgY29uc3QgV2ViR0xSZW5kZXJlciA9IGNyZWF0ZUNvbXBvbmVudENsYXNzKHtcbiAgdnI6IHsgZGVmYXVsdDogdHJ1ZSB9LFxuICBhbnRpYWxpYXM6IHtkZWZhdWx0OiB0cnVlfSxcbiAgaGFuZGxlUmVzaXplOiB7IGRlZmF1bHQ6IHRydWUgfVxufSwgXCJXZWJHTFJlbmRlcmVyXCIpO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyYWJsZUdyb3VwIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xuICB9XG59IiwiLyogZ2xvYmFsIFRIUkVFICovXG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7IFN5c3RlbSB9IGZyb20gXCJlY3N5XCI7XG5pbXBvcnQge1xuICBHZW9tZXRyeSxcbiAgT2JqZWN0M0QsXG4gIFRyYW5zZm9ybSxcbi8vICBFbGVtZW50LFxuLy8gIERyYWdnYWJsZSxcbiAgUGFyZW50XG59IGZyb20gXCIuLi9jb21wb25lbnRzL2luZGV4LmpzXCI7XG5cbi8qKlxuICogQ3JlYXRlIGEgTWVzaCBiYXNlZCBvbiB0aGUgW0dlb21ldHJ5XSBjb21wb25lbnQgYW5kIGF0dGFjaCBpdCB0byB0aGUgZW50aXR5IHVzaW5nIGEgW09iamVjdDNEXSBjb21wb25lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEdlb21ldHJ5U3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICAvLyBSZW1vdmVkXG4gICAgdGhpcy5xdWVyaWVzLmVudGl0aWVzLnJlbW92ZWQuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgLypcbiAgICAgIGxldCBvYmplY3QgPSBlbnRpdHkuZ2V0UmVtb3ZlZENvbXBvbmVudChPYmplY3QzRCkudmFsdWU7XG4gICAgICBsZXQgcGFyZW50ID0gZW50aXR5LmdldENvbXBvbmVudChQYXJlbnQsIHRydWUpLnZhbHVlO1xuICAgICAgcGFyZW50LmdldENvbXBvbmVudChPYmplY3QzRCkudmFsdWUucmVtb3ZlKG9iamVjdCk7XG4gICAgICAqL1xuICAgIH0pO1xuXG4gICAgLy8gQWRkZWRcbiAgICB0aGlzLnF1ZXJpZXMuZW50aXRpZXMuYWRkZWQuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IGVudGl0eS5nZXRDb21wb25lbnQoR2VvbWV0cnkpO1xuXG4gICAgICBsZXQgZ2VvbWV0cnk7XG4gICAgICBzd2l0Y2ggKGNvbXBvbmVudC5wcmltaXRpdmUpIHtcbiAgICAgICAgY2FzZSBcInRvcnVzXCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVG9ydXNCdWZmZXJHZW9tZXRyeShcbiAgICAgICAgICAgICAgY29tcG9uZW50LnJhZGl1cyxcbiAgICAgICAgICAgICAgY29tcG9uZW50LnR1YmUsXG4gICAgICAgICAgICAgIGNvbXBvbmVudC5yYWRpYWxTZWdtZW50cyxcbiAgICAgICAgICAgICAgY29tcG9uZW50LnR1YnVsYXJTZWdtZW50c1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzcGhlcmVcIjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5JY29zYWhlZHJvbkJ1ZmZlckdlb21ldHJ5KGNvbXBvbmVudC5yYWRpdXMsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImJveFwiOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEJ1ZmZlckdlb21ldHJ5KFxuICAgICAgICAgICAgICBjb21wb25lbnQud2lkdGgsXG4gICAgICAgICAgICAgIGNvbXBvbmVudC5oZWlnaHQsXG4gICAgICAgICAgICAgIGNvbXBvbmVudC5kZXB0aFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGxldCBjb2xvciA9XG4gICAgICAgIGNvbXBvbmVudC5wcmltaXRpdmUgPT09IFwidG9ydXNcIiA/IDB4OTk5OTAwIDogTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmO1xuXG4gICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoe1xuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIHJvdWdobmVzczogMC43LFxuICAgICAgICBtZXRhbG5lc3M6IDAuMCxcbiAgICAgICAgZmxhdFNoYWRpbmc6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgb2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgIG9iamVjdC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgIG9iamVjdC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcblxuICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoVHJhbnNmb3JtKSkge1xuICAgICAgICBsZXQgdHJhbnNmb3JtID0gZW50aXR5LmdldENvbXBvbmVudChUcmFuc2Zvcm0pO1xuICAgICAgICBvYmplY3QucG9zaXRpb24uY29weSh0cmFuc2Zvcm0ucG9zaXRpb24pO1xuICAgICAgICBpZiAodHJhbnNmb3JtLnJvdGF0aW9uKSB7XG4gICAgICAgICAgb2JqZWN0LnJvdGF0aW9uLnNldChcbiAgICAgICAgICAgIHRyYW5zZm9ybS5yb3RhdGlvbi54LFxuICAgICAgICAgICAgdHJhbnNmb3JtLnJvdGF0aW9uLnksXG4gICAgICAgICAgICB0cmFuc2Zvcm0ucm90YXRpb24uelxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuLy8gICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudChFbGVtZW50KSAmJiAhZW50aXR5Lmhhc0NvbXBvbmVudChEcmFnZ2FibGUpKSB7XG4vLyAgICAgICAgb2JqZWN0Lm1hdGVyaWFsLmNvbG9yLnNldCgweDMzMzMzMyk7XG4vLyAgICAgIH1cblxuICAgICAgZW50aXR5LmFkZENvbXBvbmVudChPYmplY3QzRCwgeyB2YWx1ZTogb2JqZWN0IH0pO1xuXG4gICAgICAvLyBAdG9kbyBSZW1vdmUgaXQhIGhpZXJhcmNoeSBzeXN0ZW0gd2lsbCB0YWtlIGNhcmUgb2YgaXRcbiAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KFBhcmVudCkpIHtcbiAgICAgICAgZW50aXR5LmdldENvbXBvbmVudChQYXJlbnQpLnZhbHVlLmdldENvbXBvbmVudChPYmplY3QzRCkudmFsdWUuYWRkKG9iamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuR2VvbWV0cnlTeXN0ZW0ucXVlcmllcyA9IHtcbiAgZW50aXRpZXM6IHtcbiAgICBjb21wb25lbnRzOiBbR2VvbWV0cnldLCAvLyBAdG9kbyBUcmFuc2Zvcm06IEFzIG9wdGlvbmFsLCBob3cgdG8gZGVmaW5lIGl0P1xuICAgIGxpc3Rlbjoge1xuICAgICAgYWRkZWQ6IHRydWUsXG4gICAgICByZW1vdmVkOiB0cnVlXG4gICAgfVxuICB9XG59O1xuIiwiaW1wb3J0IHtHTFRGTG9hZGVyfSBmcm9tIFwidGhyZWUvZXhhbXBsZXMvanNtL2xvYWRlcnMvR0xURkxvYWRlci5qc1wiO1xuaW1wb3J0IHsgU3lzdGVtIH0gZnJvbSBcImVjc3lcIjtcbmltcG9ydCB7IFBhcmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRzL1BhcmVudC5qc1wiO1xuaW1wb3J0IHsgT2JqZWN0M0QgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9PYmplY3QzRC5qc1wiO1xuaW1wb3J0IHsgR0xURk1vZGVsIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvR0xURk1vZGVsLmpzXCI7XG5cbi8vIEB0b2RvIFVzZSBwYXJhbWV0ZXIgYW5kIGxvYWRlciBtYW5hZ2VyXG52YXIgbG9hZGVyID0gbmV3IEdMVEZMb2FkZXIoKS5zZXRQYXRoKFwiL2Fzc2V0cy9cIik7XG5cbmV4cG9ydCBjbGFzcyBHTFRGTG9hZGVyU3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB2YXIgZW50aXRpZXMgPSB0aGlzLnF1ZXJpZXMuZW50aXRpZXMuYWRkZWQ7XG5cbiAgICAvL1F1ZXJpZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXNbaV07XG4gICAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmdldENvbXBvbmVudChHTFRGTW9kZWwpO1xuXG4gICAgICBsb2FkZXIubG9hZChjb21wb25lbnQudXJsLCBnbHRmID0+IHtcbiAgICAgICAgLypcbiAgICAgICAgZ2x0Zi5zY2VuZS50cmF2ZXJzZShmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgIGlmIChjaGlsZC5pc01lc2gpIHtcbiAgICAgICAgICAgIGNoaWxkLm1hdGVyaWFsLmVudk1hcCA9IGVudk1hcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuKi9cbiAgICAgICAgLy8gQHRvZG8gUmVtb3ZlLCBoaWVyYXJjaHkgd2lsbCB0YWtlIGNhcmUgb2YgaXRcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoUGFyZW50KSkge1xuICAgICAgICAgIGVudGl0eS5nZXRDb21wb25lbnQoUGFyZW50KS52YWx1ZS5hZGQoZ2x0Zi5zY2VuZSk7XG4gICAgICAgIH1cbiAgICAgICAgZW50aXR5LmFkZENvbXBvbmVudChPYmplY3QzRCwgeyB2YWx1ZTogZ2x0Zi5zY2VuZSB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5HTFRGTG9hZGVyU3lzdGVtLnF1ZXJpZXMgPSB7XG4gIGVudGl0aWVzOiB7XG4gICAgY29tcG9uZW50czogW0dMVEZNb2RlbF0sXG4gICAgbGlzdGVuOiB7XG4gICAgICBhZGRlZDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcbiIsImltcG9ydCB7IFN5c3RlbSwgTm90IH0gZnJvbSBcImVjc3lcIjtcbmltcG9ydCB7IFNreUJveCwgT2JqZWN0M0QgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmV4cG9ydCBjbGFzcyBTa3lCb3hTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuICBleGVjdXRlKCkge1xuICAgIGxldCBlbnRpdGllcyA9IHRoaXMucXVlcmllcy5lbnRpdGllcy5yZXN1bHRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllc1tpXTtcblxuICAgICAgdmFyIHNreWJveCA9IGVudGl0eS5nZXRDb21wb25lbnQoU2t5Qm94KTtcblxuICAgICAgdmFyIGdyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XG4gICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94QnVmZmVyR2VvbWV0cnkoIDEwMCwgMTAwLCAxMDAgKTtcbiAgICAgIGdlb21ldHJ5LnNjYWxlKCAxLCAxLCAtIDEgKTtcblxuICAgICAgaWYgKHNreWJveC50eXBlID09PSAnY3ViZW1hcC1zdGVyZW8nKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlcyA9IGdldFRleHR1cmVzRnJvbUF0bGFzRmlsZSggc2t5Ym94LnRleHR1cmVVcmwsIDEyICk7XG5cbiAgICAgICAgdmFyIG1hdGVyaWFscyA9IFtdO1xuXG4gICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IDY7IGkgKysgKSB7XG4gIFxuICAgICAgICAgIG1hdGVyaWFscy5wdXNoKCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgbWFwOiB0ZXh0dXJlc1sgaSBdIH0gKSApO1xuICBcbiAgICAgICAgfVxuICBcbiAgICAgICAgdmFyIHNreUJveCA9IG5ldyBUSFJFRS5NZXNoKCBnZW9tZXRyeSwgbWF0ZXJpYWxzICk7XG4gICAgICAgIHNreUJveC5sYXllcnMuc2V0KCAxICk7XG4gICAgICAgIGdyb3VwLmFkZChza3lCb3gpO1xuICBcbiAgICAgICAgdmFyIG1hdGVyaWFsc1IgPSBbXTtcbiAgXG4gICAgICAgIGZvciAoIHZhciBpID0gNjsgaSA8IDEyOyBpICsrICkge1xuICBcbiAgICAgICAgICBtYXRlcmlhbHNSLnB1c2goIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBtYXA6IHRleHR1cmVzWyBpIF0gfSApICk7XG4gIFxuICAgICAgICB9XG4gIFxuICAgICAgICB2YXIgc2t5Qm94UiA9IG5ldyBUSFJFRS5NZXNoKCBnZW9tZXRyeSwgbWF0ZXJpYWxzUiApO1xuICAgICAgICBza3lCb3hSLmxheWVycy5zZXQoIDIgKTtcbiAgICAgICAgZ3JvdXAuYWRkKHNreUJveFIpO1xuXG4gICAgICAgIGVudGl0eS5hZGRDb21wb25lbnQoT2JqZWN0M0QsIHsgdmFsdWU6IGdyb3VwIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHNreWJveCB0eXBlOiAnLCBza3lib3gudHlwZSk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBnZXRUZXh0dXJlc0Zyb21BdGxhc0ZpbGUoIGF0bGFzSW1nVXJsLCB0aWxlc051bSApIHtcblxuICB2YXIgdGV4dHVyZXMgPSBbXTtcblxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aWxlc051bTsgaSArKyApIHtcblxuICAgIHRleHR1cmVzWyBpIF0gPSBuZXcgVEhSRUUuVGV4dHVyZSgpO1xuXG4gIH1cblxuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkltYWdlTG9hZGVyKCk7XG4gIGxvYWRlci5sb2FkKCBhdGxhc0ltZ1VybCwgZnVuY3Rpb24gKCBpbWFnZU9iaiApIHtcblxuICAgIHZhciBjYW52YXMsIGNvbnRleHQ7XG4gICAgdmFyIHRpbGVXaWR0aCA9IGltYWdlT2JqLmhlaWdodDtcblxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHRleHR1cmVzLmxlbmd0aDsgaSArKyApIHtcblxuICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICAgICAgY2FudmFzLmhlaWdodCA9IHRpbGVXaWR0aDtcbiAgICAgIGNhbnZhcy53aWR0aCA9IHRpbGVXaWR0aDtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBpbWFnZU9iaiwgdGlsZVdpZHRoICogaSwgMCwgdGlsZVdpZHRoLCB0aWxlV2lkdGgsIDAsIDAsIHRpbGVXaWR0aCwgdGlsZVdpZHRoICk7XG4gICAgICB0ZXh0dXJlc1sgaSBdLmltYWdlID0gY2FudmFzO1xuICAgICAgdGV4dHVyZXNbIGkgXS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICB9XG5cbiAgfSApO1xuXG4gIHJldHVybiB0ZXh0dXJlcztcblxufVxuXG5Ta3lCb3hTeXN0ZW0ucXVlcmllcyA9IHtcbiAgZW50aXRpZXM6IHtcbiAgICBjb21wb25lbnRzOiBbU2t5Qm94LCBOb3QoT2JqZWN0M0QpXVxuICB9XG59O1xuIiwiaW1wb3J0IHsgU3lzdGVtIH0gZnJvbSBcImVjc3lcIjtcbmltcG9ydCB7IFZpc2libGUsIE9iamVjdDNEIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvaW5kZXguanNcIjtcblxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuICBwcm9jZXNzVmlzaWJpbGl0eShlbnRpdGllcykge1xuICAgIGVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgIGVudGl0eS5nZXRNdXRhYmxlQ29tcG9uZW50KE9iamVjdDNEKS52YWx1ZS52aXNpYmxlID0gZW50aXR5LmdldENvbXBvbmVudChcbiAgICAgICAgVmlzaWJsZVxuICAgICAgKS52YWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5wcm9jZXNzVmlzaWJpbGl0eSh0aGlzLnF1ZXJpZXMuZW50aXRpZXMuYWRkZWQpO1xuICAgIHRoaXMucHJvY2Vzc1Zpc2liaWxpdHkodGhpcy5xdWVyaWVzLmVudGl0aWVzLmNoYW5nZWQpO1xuICB9XG59XG5cblZpc2liaWxpdHlTeXN0ZW0ucXVlcmllcyA9IHtcbiAgZW50aXRpZXM6IHtcbiAgICBjb21wb25lbnRzOiBbVmlzaWJsZSwgT2JqZWN0M0RdLFxuICAgIGxpc3Rlbjoge1xuICAgICAgYWRkZWQ6IHRydWUsXG4gICAgICBjaGFuZ2VkOiBbVmlzaWJsZV1cbiAgICB9XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBTeXN0ZW0sIE5vdCB9IGZyb20gXCJlY3N5XCI7XG5pbXBvcnQgeyBSZW5kZXJhYmxlR3JvdXAsIFdlYkdMUmVuZGVyZXIsIE9iamVjdDNEIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHsgV0VCVlIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vdnIvV2ViVlIuanMnO1xuXG5jbGFzcyBXZWJHTFJlbmRlcmVyQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJHTFJlbmRlcmVyU3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcbiAgaW5pdCgpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicmVzaXplXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMucXVlcmllcy5yZW5kZXJlcnMucmVzdWx0cy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGVudGl0eS5nZXRNdXRhYmxlQ29tcG9uZW50KFdlYkdMUmVuZGVyZXIpO1xuICAgICAgICAgIGNvbXBvbmVudC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgIGNvbXBvbmVudC5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgZmFsc2VcbiAgICApO1xuICB9XG5cbiAgZXhlY3V0ZShkZWx0YSkge1xuICAgIC8vIFVuaW5pdGlhbGl6ZWQgcmVuZGVyZXJzXG4gICAgdGhpcy5xdWVyaWVzLnVuaW5pdGlhbGl6ZWRSZW5kZXJlcnMucmVzdWx0cy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmdldENvbXBvbmVudChXZWJHTFJlbmRlcmVyKTtcblxuICAgICAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogY29tcG9uZW50LmFudGlhbGlhc30pO1xuXG4gICAgICByZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyApO1xuICAgICAgaWYgKGNvbXBvbmVudC5oYW5kbGVSZXNpemUpIHtcblx0XHRcdFx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuICAgICAgfVxuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XG5cbiAgICAgIGlmIChjb21wb25lbnQudnIpIHtcbiAgICAgICAgcmVuZGVyZXIudnIuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIFdFQlZSLmNyZWF0ZUJ1dHRvbiggcmVuZGVyZXIsIHsgcmVmZXJlbmNlU3BhY2VUeXBlOiAnbG9jYWwnIH0gKSApO1xuICAgICAgfVxuXG4gICAgICBlbnRpdHkuYWRkQ29tcG9uZW50KFdlYkdMUmVuZGVyZXJDb250ZXh0LCB7cmVuZGVyZXI6IHJlbmRlcmVyfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJpZXMucmVuZGVyZXJzLmNoYW5nZWQuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgdmFyIGNvbXBvbmVudCA9IGVudGl0eS5nZXRDb21wb25lbnQoV2ViR0xSZW5kZXJlcik7XG4gICAgICB2YXIgcmVuZGVyZXIgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KFdlYkdMUmVuZGVyZXJDb250ZXh0KS5yZW5kZXJlcjtcbiAgICAgIGlmIChjb21wb25lbnQud2lkdGggIT09IHJlbmRlcmVyLndpZHRoIHx8IGNvbXBvbmVudC5oZWlnaHQgIT09IHJlbmRlcmVyLmhlaWdodCkge1xuICAgICAgICByZW5kZXJlci5zZXRTaXplKCBjb21wb25lbnQud2lkdGgsIGNvbXBvbmVudC5oZWlnaHQgKTtcbiAgICAgICAgLy8gaW5uZXJXaWR0aC9pbm5lckhlaWdodFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHJlbmRlcmVycyA9IHRoaXMucXVlcmllcy5yZW5kZXJlcnMucmVzdWx0cztcbiAgICByZW5kZXJlcnMuZm9yRWFjaChyZW5kZXJlckVudGl0eSA9PiB7XG4gICAgICB2YXIgcmVuZGVyZXIgPSByZW5kZXJlckVudGl0eS5nZXRDb21wb25lbnQoV2ViR0xSZW5kZXJlckNvbnRleHQpLnJlbmRlcmVyO1xuICAgICAgdGhpcy5xdWVyaWVzLnJlbmRlcmFibGVzLnJlc3VsdHMuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgICB2YXIgZ3JvdXAgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KFJlbmRlcmFibGVHcm91cCk7XG4gICAgICAgIHZhciBzY2VuZSA9IGdyb3VwLnNjZW5lLmdldENvbXBvbmVudChPYmplY3QzRCkudmFsdWU7XG4gICAgICAgIHZhciBjYW1lcmEgPSBncm91cC5jYW1lcmEuZ2V0Q29tcG9uZW50KE9iamVjdDNEKS52YWx1ZTtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5XZWJHTFJlbmRlcmVyU3lzdGVtLnF1ZXJpZXMgPSB7XG4gIHVuaW5pdGlhbGl6ZWRSZW5kZXJlcnM6IHtcbiAgICBjb21wb25lbnRzOiBbV2ViR0xSZW5kZXJlciwgTm90KFdlYkdMUmVuZGVyZXJDb250ZXh0KV0sXG4gIH0sXG4gIHJlbmRlcmVyczoge1xuICAgIGNvbXBvbmVudHM6IFtXZWJHTFJlbmRlcmVyLCBXZWJHTFJlbmRlcmVyQ29udGV4dF0sXG4gICAgbGlzdGVuOiB7XG4gICAgICBjaGFuZ2VkOiBbV2ViR0xSZW5kZXJlcl1cbiAgICB9XG4gIH0sXG4gIHJlbmRlcmFibGVzOiB7XG4gICAgY29tcG9uZW50czogW1JlbmRlcmFibGVHcm91cF1cbiAgfVxufTtcbiIsImltcG9ydCB7IFN5c3RlbSwgTm90IH0gZnJvbSBcImVjc3lcIjtcbmltcG9ydCB7IFBhcmVudCwgT2JqZWN0M0QgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1TeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuICBleGVjdXRlKGRlbHRhKSB7XG4gICAgLy8gSGllcmFyY2h5XG4gICAgbGV0IGFkZGVkID0gdGhpcy5xdWVyaWVzLnBhcmVudC5hZGRlZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFkZGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gYWRkZWRbaV07XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nJywgaSk7XG4gICAgICB2YXIgcGFyZW50RW50aXR5ID0gZW50aXR5LmdldENvbXBvbmVudChQYXJlbnQpLnZhbHVlO1xuICAgICAgcGFyZW50RW50aXR5LmdldENvbXBvbmVudChPYmplY3QzRCkudmFsdWUuYWRkKGVudGl0eS5nZXRDb21wb25lbnQoT2JqZWN0M0QpLnZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuVHJhbnNmb3JtU3lzdGVtLnF1ZXJpZXMgPSB7XG4gIHBhcmVudDoge1xuICAgIGNvbXBvbmVudHM6IFtQYXJlbnQsIE9iamVjdDNEXSxcbiAgICBsaXN0ZW46IHtcbiAgICAgIGFkZGVkOiB0cnVlXG4gICAgfVxuICB9XG59O1xuIiwiaW1wb3J0IHsgU3lzdGVtLCBOb3QgfSBmcm9tIFwiZWNzeVwiO1xuaW1wb3J0IHsgQ2FtZXJhLCBPYmplY3QzRCB9IGZyb20gXCIuLi9jb21wb25lbnRzL2luZGV4LmpzXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuZXhwb3J0IGNsYXNzIENhbWVyYVN5c3RlbSBleHRlbmRzIFN5c3RlbSB7XG4gIGluaXQoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJpZXMuY2FtZXJhcy5yZXN1bHRzLmZvckVhY2goY2FtZXJhID0+IHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNhbWVyYS5nZXRDb21wb25lbnQoQ2FtZXJhKTtcbiAgICAgICAgaWYgKGNvbXBvbmVudC5oYW5kbGVSZXNpemUpIHtcbiAgICAgICAgICBjYW1lcmEuZ2V0TXV0YWJsZUNvbXBvbmVudChDYW1lcmEpLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3BlY3QgdXBkYXRlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCBmYWxzZSApO1xuICB9XG5cbiAgZXhlY3V0ZShkZWx0YSkge1xuICAgIGxldCBjaGFuZ2VkID0gdGhpcy5xdWVyaWVzLmNhbWVyYXMuY2hhbmdlZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBjaGFuZ2VkW2ldO1xuXG4gICAgICB2YXIgY29tcG9uZW50ID0gZW50aXR5LmdldENvbXBvbmVudChDYW1lcmEpO1xuICAgICAgdmFyIGNhbWVyYTNkID0gZW50aXR5LmdldE11dGFibGVDb21wb25lbnQoT2JqZWN0M0QpLnZhbHVlO1xuXG4gICAgICBpZiAoY2FtZXJhM2QuYXNwZWN0ICE9PSBjb21wb25lbnQuYXNwZWN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDYW1lcmEgVXBkYXRlZCcpO1xuXG4gICAgICAgIGNhbWVyYTNkLmFzcGVjdCA9IGNvbXBvbmVudC5hc3BlY3Q7XG4gICAgICAgIGNhbWVyYTNkLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgIH1cbiAgICAgIC8vIEB0b2RvIERvIGl0IGZvciB0aGUgcmVzdCBvZiB0aGUgdmFsdWVzXG4gICAgfVxuXG5cbiAgICBsZXQgY2FtZXJhc1VuaW5pdGlhbGl6ZWQgPSB0aGlzLnF1ZXJpZXMuY2FtZXJhc1VuaW5pdGlhbGl6ZWQucmVzdWx0cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbWVyYXNVbmluaXRpYWxpemVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gY2FtZXJhc1VuaW5pdGlhbGl6ZWRbaV07XG5cbiAgICAgIHZhciBjb21wb25lbnQgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KENhbWVyYSk7XG5cbiAgICAgIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgIGNvbXBvbmVudC5mb3YsXG4gICAgICAgIGNvbXBvbmVudC5hc3BlY3QsXG4gICAgICAgIGNvbXBvbmVudC5uZWFyLFxuICAgICAgICBjb21wb25lbnQuZmFyICk7XG5cbiAgICAgIGNhbWVyYS5sYXllcnMuZW5hYmxlKCBjb21wb25lbnQubGF5ZXJzICk7XG5cbiAgICAgIGVudGl0eS5hZGRDb21wb25lbnQoT2JqZWN0M0QsIHsgdmFsdWU6IGNhbWVyYSB9KTtcbiAgICB9XG4gIH1cbn1cblxuQ2FtZXJhU3lzdGVtLnF1ZXJpZXMgPSB7XG4gIGNhbWVyYXNVbmluaXRpYWxpemVkOiB7XG4gICAgY29tcG9uZW50czogW0NhbWVyYSwgTm90KE9iamVjdDNEKV1cbiAgfSxcbiAgY2FtZXJhczoge1xuICAgIGNvbXBvbmVudHM6IFtDYW1lcmEsIE9iamVjdDNEXSxcbiAgICBsaXN0ZW46IHtcbiAgICAgIGNoYW5nZWQ6IFtDYW1lcmFdXG4gICAgfVxuICB9XG59O1xuIiwiLyogZ2xvYmFsIFRIUkVFICovXG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7IFN5c3RlbSB9IGZyb20gXCJlY3N5XCI7XG5pbXBvcnQge1xuICBUZXh0R2VvbWV0cnksXG4gIE9iamVjdDNEXG59IGZyb20gXCIuLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgVGV4dEdlb21ldHJ5U3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcbiAgaW5pdCgpIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG4gICAgdGhpcy5mb250ID0gbnVsbDtcbiAgICBsb2FkZXIubG9hZChcIi9hc3NldHMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb25cIiwgZm9udCA9PiB7XG4gICAgICB0aGlzLmZvbnQgPSBmb250O1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICghdGhpcy5mb250KSByZXR1cm47XG5cbiAgICB2YXIgY2hhbmdlZCA9IHRoaXMucXVlcmllcy5lbnRpdGllcy5jaGFuZ2VkO1xuICAgIGNoYW5nZWQuZm9yRWFjaChlbnRpdHkgPT4ge1xuICAgICAgdmFyIHRleHRDb21wb25lbnQgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KFRleHRHZW9tZXRyeSk7XG4gICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KHRleHRDb21wb25lbnQudGV4dCwge1xuICAgICAgICBmb250OiB0aGlzLmZvbnQsXG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGhlaWdodDogMC4xLFxuICAgICAgICBjdXJ2ZVNlZ21lbnRzOiAzLFxuICAgICAgICBiZXZlbEVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGJldmVsVGhpY2tuZXNzOiAwLjAzLFxuICAgICAgICBiZXZlbFNpemU6IDAuMDMsXG4gICAgICAgIGJldmVsT2Zmc2V0OiAwLFxuICAgICAgICBiZXZlbFNlZ21lbnRzOiAzXG4gICAgICB9KTtcbiAgICAgIHZhciBvYmplY3QgPSBlbnRpdHkuZ2V0TXV0YWJsZUNvbXBvbmVudChPYmplY3QzRCkudmFsdWU7XG4gICAgICBvYmplY3QuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICB9KTtcblxuICAgIHZhciBhZGRlZCA9IHRoaXMucXVlcmllcy5lbnRpdGllcy5hZGRlZDtcbiAgICBhZGRlZC5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICB2YXIgdGV4dENvbXBvbmVudCA9IGVudGl0eS5nZXRDb21wb25lbnQoVGV4dEdlb21ldHJ5KTtcbiAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkodGV4dENvbXBvbmVudC50ZXh0LCB7XG4gICAgICAgIGZvbnQ6IHRoaXMuZm9udCxcbiAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgaGVpZ2h0OiAwLjEsXG4gICAgICAgIGN1cnZlU2VnbWVudHM6IDMsXG4gICAgICAgIGJldmVsRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgYmV2ZWxUaGlja25lc3M6IDAuMDMsXG4gICAgICAgIGJldmVsU2l6ZTogMC4wMyxcbiAgICAgICAgYmV2ZWxPZmZzZXQ6IDAsXG4gICAgICAgIGJldmVsU2VnbWVudHM6IDNcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY29sb3IgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmY7XG4gICAgICBjb2xvciA9IDB4ZmZmZmZmO1xuICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICByb3VnaG5lc3M6IDAuNyxcbiAgICAgICAgbWV0YWxuZXNzOiAwLjBcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cbiAgICAgIGVudGl0eS5hZGRDb21wb25lbnQoT2JqZWN0M0QsIHsgdmFsdWU6IG1lc2ggfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuVGV4dEdlb21ldHJ5U3lzdGVtLnF1ZXJpZXMgPSB7XG4gIGVudGl0aWVzOiB7XG4gICAgY29tcG9uZW50czogW1RleHRHZW9tZXRyeV0sXG4gICAgbGlzdGVuOiB7XG4gICAgICBhZGRlZDogdHJ1ZSxcbiAgICAgIGNoYW5nZWQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBFQ1NZIGZyb20gXCJlY3N5XCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuLy8gY29tcG9uZW50c1xuZXhwb3J0IHtcbiAgU2t5Qm94LFxuICBPYmplY3QzRCxcbiAgVmlzaWJsZSxcbiAgQ2FtZXJhUmlnLFxuICBEcmFnZ2FibGUsXG4gIERyYWdnaW5nLFxuICBBY3RpdmUsXG4gIFRyYW5zZm9ybSxcbiAgR2VvbWV0cnksXG4gIFNjZW5lLFxuICBDYW1lcmEsXG4gIFBhcmVudCxcbiAgR0xURk1vZGVsLFxuICBUZXh0R2VvbWV0cnksXG4gIFZSQ29udHJvbGxlcixcbiAgTWF0ZXJpYWwsXG4gIFNreSB9IGZyb20gXCIuL2NvbXBvbmVudHMvaW5kZXguanNcIjtcblxuLy8gc3lzdGVtc1xuZXhwb3J0IHsgR2VvbWV0cnlTeXN0ZW0gfSBmcm9tIFwiLi9zeXN0ZW1zL0dlb21ldHJ5U3lzdGVtLmpzXCI7XG5leHBvcnQgeyBHTFRGTG9hZGVyU3lzdGVtIH0gZnJvbSBcIi4vc3lzdGVtcy9HTFRGTG9hZGVyU3lzdGVtLmpzXCI7XG5leHBvcnQgeyBTa3lCb3hTeXN0ZW0gfSBmcm9tIFwiLi9zeXN0ZW1zL1NreUJveFN5c3RlbS5qc1wiO1xuZXhwb3J0IHsgVmlzaWJpbGl0eVN5c3RlbSB9IGZyb20gXCIuL3N5c3RlbXMvVmlzaWJpbGl0eVN5c3RlbS5qc1wiO1xuZXhwb3J0IHsgV2ViR0xSZW5kZXJlclN5c3RlbSB9IGZyb20gXCIuL3N5c3RlbXMvV2ViR0xSZW5kZXJlclN5c3RlbS5qc1wiO1xuZXhwb3J0IHsgVHJhbnNmb3JtU3lzdGVtIH0gZnJvbSBcIi4vc3lzdGVtcy9UcmFuc2Zvcm1TeXN0ZW0uanNcIjtcbmV4cG9ydCB7IENhbWVyYVN5c3RlbSB9IGZyb20gXCIuL3N5c3RlbXMvQ2FtZXJhU3lzdGVtLmpzXCI7XG5leHBvcnQgeyBUZXh0R2VvbWV0cnlTeXN0ZW0gfSBmcm9tIFwiLi9zeXN0ZW1zL1RleHRHZW9tZXRyeVN5c3RlbS5qc1wiO1xuXG5pbXBvcnQgeyBUcmFuc2Zvcm1TeXN0ZW0gfSBmcm9tIFwiLi9zeXN0ZW1zL1RyYW5zZm9ybVN5c3RlbS5qc1wiO1xuaW1wb3J0IHsgQ2FtZXJhU3lzdGVtIH0gZnJvbSBcIi4vc3lzdGVtcy9DYW1lcmFTeXN0ZW0uanNcIjtcbmltcG9ydCB7IFdlYkdMUmVuZGVyZXJTeXN0ZW0gfSBmcm9tIFwiLi9zeXN0ZW1zL1dlYkdMUmVuZGVyZXJTeXN0ZW0uanNcIjtcbmltcG9ydCB7IE9iamVjdDNEIH0gZnJvbSBcIi4vY29tcG9uZW50cy9PYmplY3QzRC5qc1wiO1xuaW1wb3J0IHsgV2ViR0xSZW5kZXJlciwgUmVuZGVyYWJsZUdyb3VwLCBDYW1lcmEgfSBmcm9tIFwiLi9jb21wb25lbnRzL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KHdvcmxkKSB7XG4gIHdvcmxkXG4gICAgLnJlZ2lzdGVyU3lzdGVtKFRyYW5zZm9ybVN5c3RlbSlcbiAgICAucmVnaXN0ZXJTeXN0ZW0oQ2FtZXJhU3lzdGVtKVxuICAgIC5yZWdpc3RlclN5c3RlbShXZWJHTFJlbmRlcmVyU3lzdGVtLCB7cHJpb3JpdHk6IDF9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVEZWZhdWx0KHdvcmxkID0gbmV3IEVDU1kuV29ybGQoKSkge1xuICBpbml0KHdvcmxkKTtcblxuICBsZXQgc2NlbmUgPSB3b3JsZC5jcmVhdGVFbnRpdHkoKS5hZGRDb21wb25lbnQoT2JqZWN0M0QgLyogU2NlbmUgKi8sIHt2YWx1ZTogbmV3IFRIUkVFLlNjZW5lKCl9KTtcbiAgbGV0IHJlbmRlcmVyID0gd29ybGQuY3JlYXRlRW50aXR5KCkuYWRkQ29tcG9uZW50KFdlYkdMUmVuZGVyZXIpO1xuICBsZXQgY2FtZXJhID0gd29ybGQuY3JlYXRlRW50aXR5KCkuYWRkQ29tcG9uZW50KENhbWVyYSwge1xuICAgIGZvdjogOTAsXG4gICAgYXNwZWN0OiB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCxcbiAgICBuZWFyOiAxLFxuICAgIGZhcjogMTAwMCxcbiAgICBsYXllcnM6IDEsXG4gICAgaGFuZGxlUmVzaXplOiB0cnVlXG4gIH0pO1xuXG4gIGxldCByZW5kZXJhYmxlcyA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpLmFkZENvbXBvbmVudChSZW5kZXJhYmxlR3JvdXAsIHtcbiAgICBzY2VuZTogc2NlbmUsXG4gICAgY2FtZXJhOiBjYW1lcmFcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JsZCxcbiAgICBlbnRpdGllczoge1xuICAgICAgc2NlbmUsXG4gICAgICBjYW1lcmEsXG4gICAgICByZW5kZXJlcixcbiAgICAgIHJlbmRlcmFibGVzXG4gICAgfVxuICB9O1xufSJdLCJuYW1lcyI6WyJUYWdDb21wb25lbnQiLCJUSFJFRS5WZWN0b3IzIiwiY3JlYXRlQ29tcG9uZW50Q2xhc3MiLCJTeXN0ZW0iLCJUSFJFRS5Ub3J1c0J1ZmZlckdlb21ldHJ5IiwiVEhSRUUuSWNvc2FoZWRyb25CdWZmZXJHZW9tZXRyeSIsIlRIUkVFLkJveEJ1ZmZlckdlb21ldHJ5IiwiVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwiLCJUSFJFRS5NZXNoIiwiR0xURkxvYWRlciIsIlRIUkVFLkdyb3VwIiwiVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwiLCJUSFJFRS5UZXh0dXJlIiwiVEhSRUUuSW1hZ2VMb2FkZXIiLCJOb3QiLCJUSFJFRS5XZWJHTFJlbmRlcmVyIiwiV0VCVlIiLCJUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSIsIlRIUkVFLkZvbnRMb2FkZXIiLCJUSFJFRS5UZXh0R2VvbWV0cnkiLCJFQ1NZLldvcmxkIiwiVEhSRUUuU2NlbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0NBQU8sTUFBTSxLQUFLLENBQUM7Q0FDbkIsRUFBRSxXQUFXLEdBQUc7Q0FDaEIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztDQUN0QixHQUFHOztDQUVILEVBQUUsS0FBSyxHQUFHO0NBQ1YsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztDQUN0QixHQUFHO0NBQ0gsQ0FBQzs7Q0NSTSxNQUFNLE1BQU0sQ0FBQztDQUNwQixFQUFFLFdBQVcsR0FBRztDQUNoQixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0NBQ3RCLEdBQUc7O0NBRUgsRUFBRSxLQUFLLEdBQUc7Q0FDVixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0NBQ3RCLEdBQUc7Q0FDSCxDQUFDOztDQ1JNLE1BQU0sTUFBTSxDQUFDO0NBQ3BCLEVBQUUsV0FBVyxHQUFHO0NBQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FD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
