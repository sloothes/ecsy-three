import {Component, Types} from "/web_modules/ecsy.js";
export class RenderPass extends Component {
}
RenderPass.schema = {
  scene: {
    default: null,
    type: Types.Ref
  },
  camera: {
    default: null,
    type: Types.Ref
  }
};
