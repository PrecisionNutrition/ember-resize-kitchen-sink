import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import compileMatchers from '../utils/compile-matchers';

export default class ResizeObserverComponent extends Component {
  @tracked width;
  @tracked height;

  constructor(owner, args) {
    super(owner, args);
    this.width = args.defaultWidth || 0;
    this.height = args.defaultHeight || 0;
  }

  get API() {
    const { matches, width, height, aspectRatio, onResize } = this;

    return {
      is: matches,
      width,
      height,
      aspectRatio,
      onResize,
    };
  }

  get aspectRatio() {
    return this.width / this.height || 0;
  }

  @computed('args.matchers')
  get matchers() {
    const { matchers } = this.args;
    return matchers ? compileMatchers(matchers) : [];
  }

  get matches() {
    const { width, height, aspectRatio, matchers } = this;
    const features = { width, height, aspectRatio };
    const matches = {};

    matchers.forEach(({ name, match }) => {
      matches[name] = match(features);
    });

    return matches;
  }

  @action
  onResize({ contentRect: { width, height } }) {
    this.width = width;
    this.height = height;
  }
}
