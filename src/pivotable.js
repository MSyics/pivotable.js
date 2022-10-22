export function render(options = null) {
  Pivotable.render(options);
}
export function renderOf(index = 0, options = null) {
  Pivotable.renderOf(index, options);
}
export const options = function () {
  return Object.assign({}, defaultOptions);
}

const defaultOptions = {
  // RL : right to left
  // LR : left to right
  // '' or other : top to bottom 
  contentSlideDirection: 'RL',
  animationDuration: 200,
  headerOpacity: 1,
  fixedHeaders: false,
  isNoWrapHeaders: true,
  headerContainerTagName: 'div',
  contentContainerTagName: 'div',
  contentTagName: 'div'
}

class Pivotable {
  static render(options = null) {
    for (const pivot of document.body.querySelectorAll('.pivotable')) {
      new Pivotable(options).render(pivot);
    }
  }
  static renderOf(index, options = null) {
    const pivots = document.body.querySelectorAll('.pivotable');
    new Pivotable(options).render(pivots[index]);
  }

  pivot = undefined
  animating = false
  contentContainer = undefined

  constructor(options = null) {
    Object.assign(this, options === null ? defaultOptions : options);
  }

  render(pivot) {
    this.pivot = pivot;

    const headerContainer = this.createHeaderContainer();
    const contentContainer = this.createcCntentContainer();
    const items = this.getItemAll(this.pivot)
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const content = this.createContent();
      const header = this.getHeader(item);
      const headerWidth = header.clientWidth;
      header.parentNode.removeChild(header);
      item.parentNode.removeChild(item);
      headerContainer.appendChild(header);
      contentContainer.appendChild(content);
      for (const el of item.childNodes) content.appendChild(el);
      header.addEventListener('click', () => this.onHeaderClick(header));
      header.setAttribute('index', index);
      header.style.width = `${headerWidth}px`;
      if (index === 0) {
        header.classList.add('pivotable-current');
        content.classList.add('pivotable-current');
      } else {
        header.style.opacity = this.headerOpacity;
        content.classList.add("pivotable-hide");
      }
    }

    this.contentContainer = contentContainer;
    this.pivot.appendChild(headerContainer);
    this.pivot.appendChild(contentContainer);

    pivot.style.opacity = 1;
  }

  onHeaderClick(el) {
    if (el.classList.contains('pivotable-current')) return;
    if (this.animating) return;

    this.animating = true;
    this.setCurrentHeader(el);

    const index = el.getAttribute('index');
    const content = this.contentContainer.childNodes[index];
    this.setCurrentContent(content);

    setTimeout(() => this.animating = false, this.animationDuration + 10);
  }

  setCurrentHeader(el) {
    const current = this.getCurrentHeader();
    current.classList.remove('pivotable-current');
    current.style.opacity = this.headerOpacity;
    el.classList.add('pivotable-current');
    el.style.opacity = 1;
    if (this.fixedHeaders) return;

    const detaches = this.prevAll(el);
    if (detaches.length === 0) return;

    const delay = this.animationDuration / (detaches.length + 1)
    let count = 1;
    for (const detach of detaches) {
      const parent = detach.parentNode;
      const copy = detach.cloneNode(true);
      const width = detach.clientWidth;

      setTimeout(() => {
        detach.style.width = 0;
        detach.style.opacity = 0;
        detach.style.margin = 0;
        detach.style.transition = `
          width ${this.animationDuration}ms, 
          opacity ${this.animationDuration}ms, 
          margin ${this.animationDuration}ms`;
        setTimeout(() => parent.removeChild(detach), this.animationDuration);
      }, 0);

      setTimeout(() => {
        copy.style.width = 0;
        copy.style.opacity = 0.13;
        parent.appendChild(copy);
        setTimeout(() => {
          copy.addEventListener('click', () => this.onHeaderClick(copy));
          copy.style.width = `${width}px`;
          copy.style.opacity = this.headerOpacity;
          copy.style.transition = `
            width ${this.animationDuration / 3.33}ms, 
            opacity ${this.animationDuration}ms`;
          setTimeout(() => {
            copy.style.transition = '';
          }, this.animationDuration);
        }, this.animationDuration / 3.33);
      }, delay * count++);
    }
  }

  setCurrentContent(el) {
    const duration = this.animationDuration;
    function animate(fnc) {
      setTimeout(() => {
        fnc();
        setTimeout(() => {
          el.style = '';
        }, duration);
      }, duration / 3.33);
    }

    const current = this.getCurrentContent();
    current.classList.remove('pivotable-current');
    current.classList.add("pivotable-hide");

    el.style.overflow = 'hidden';
    el.style.opacity = 0;
    el.classList.add('pivotable-current');
    el.classList.remove("pivotable-hide");

    const width = el.clientWidth;
    const height = el.clientHeight;
    el.style.maxHeight = 0;

    if (this.contentSlideDirection === 'RL') {
      el.style.marginLeft = '133px';
      animate(() => {
        el.style.opacity = 1;
        el.style.maxHeight = `${height}px`;
        el.style.marginLeft = 0;
        el.style.transition = `
          opacity ${this.animationDuration}ms ,
          max-height ${this.animationDuration / 3.33}ms,
          margin-left ${this.animationDuration / 1.33}ms`;
      });
    } else if (this.contentSlideDirection === 'LR') {
      el.style.maxWidth = 0;
      animate(() => {
        el.style.opacity = 1;
        el.style.maxHeight = `${height}px`;
        el.style.maxWidth = `${width}px`;
        el.style.transition = `
          opacity ${this.animationDuration}ms,
          max-height ${this.animationDuration / 3.33}ms,
          max-width ${this.animationDuration / 1.33}ms`;
      });
    } else {
      animate(() => {
        el.style.opacity = 1;
        el.style.maxHeight = `${height}px`;
        el.style.transition = `
          opacity ${this.animationDuration}ms,
          max-height ${this.animationDuration / 3.33}ms`;
      });
    }
  }

  prevAll(el) {
    const elements = [];
    let current = el.parentNode.firstElementChild;
    while (current !== el) {
      elements.push(current);
      current = current.nextElementSibling;
    }
    return elements;
  }

  getItemAll(el) { return el.querySelectorAll('.pivotable-item'); }
  getHeader(el) { return el.querySelector('.pivotable-header'); }
  getCurrentHeader() { return this.pivot.querySelector('.pivotable-header.pivotable-current'); }
  getCurrentContent() { return this.pivot.querySelector('.pivotable-content.pivotable-current'); }
  createContent() {
    const el = document.createElement(this.contentTagName);
    el.className = 'pivotable-content';
    return el;
  }
  createHeaderContainer() {
    const el = document.createElement(this.headerContainerTagName);
    if (this.isNoWrapHeaders) el.style.whiteSpace = 'nowrap';
    el.style.overflow = 'hidden';
    return el;
  }
  createcCntentContainer() { return document.createElement(this.contentContainerTagName); }
}
