/* eslint-disable */
/**
 * 在移动端自动变动当前页面html的size大小（非压缩版，备份）
 * 线上的在public目录中，手动压缩
 */
const pageSizeRem = () => {
  (function (win, lib) {
    if (typeof win === 'undefined') return;
    const doc = win.document;
    const docEl = doc.documentElement;
    let metaEl = doc.querySelector('meta[name="viewport"]');
    const flexibleEl = doc.querySelector('meta[name="flexible"]');
    let dpr = 0;
    let scale = 0;
    let tid;
    const flexible = lib.flexible || (lib.flexible = {});

    if (metaEl) {
      const match = metaEl
        .getAttribute('content')
        .match(/initial\-scale=([\d/\.]+)/);
      if (match) {
        scale = parseFloat(match[1]);
        dpr = parseInt(1 / scale);
      }
    } else if (flexibleEl) {
      const content = flexibleEl.getAttribute('content');
      if (content) {
        const initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
        const maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
        if (initialDpr) {
          dpr = parseFloat(initialDpr[1]);
          scale = parseFloat((1 / dpr).toFixed(2));
        }
        if (maximumDpr) {
          dpr = parseFloat(maximumDpr[1]);
          scale = parseFloat((1 / dpr).toFixed(2));
        }
      }
    }

    if (!dpr && !scale) {
      // var isAndroid = win.navigator.appVersion.match(/android/gi);
      const isIPhone = win.navigator.appVersion.match(/iphone/gi);
      const { devicePixelRatio } = win;
      if (isIPhone) {
        // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
        if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
          dpr = 3;
        } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
          dpr = 2;
        } else {
          dpr = 1;
        }
      } else {
        // 其他设备下，仍旧使用1倍的方案
        dpr = 1;
      }
      scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', dpr);
    if (!metaEl) {
      metaEl = doc.createElement('meta');
      metaEl.setAttribute('name', 'viewport');
      metaEl.setAttribute(
        'content',
        `initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`
      );
      if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(metaEl);
      } else {
        const wrap = doc.createElement('div');
        wrap.appendChild(metaEl);
        doc.write(wrap.innerHTML);
      }
    }

    function refreshRem() {
      let { width } = docEl.getBoundingClientRect();
      if (width / dpr > 1024) {
        width = 1024 * dpr;
        const scales = document.documentElement.clientWidth / 1024;
        // 设置页面根节点字体大小（“Math.min(scale, 2)” 指最高放大比例为2，可根据实际业务需求调整）
        document.documentElement.style.fontSize = `${
          75 * Math.min(scales, 1)
        }px`;
        return;
      }
      const rem = width / 10;
      docEl.style.fontSize = `${rem}px`;
      flexible.rem = win.rem = rem;
    }

    win.addEventListener(
      'resize',
      function () {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
      },
      false
    );
    win.addEventListener(
      'pageshow',
      function (e) {
        if (e.persisted) {
          clearTimeout(tid);
          tid = setTimeout(refreshRem, 300);
        }
      },
      false
    );

    if (doc.readyState === 'complete') {
      doc.body.style.fontSize = `${12 * dpr}px`;
    } else {
      doc.addEventListener(
        'DOMContentLoaded',
        function (e) {
          doc.body.style.fontSize = `${12 * dpr}px`;
        },
        false
      );
    }

    refreshRem();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function (d) {
      let val = parseFloat(d) * this.rem;
      if (typeof d === 'string' && d.match(/rem$/)) {
        val += 'px';
      }
      return val;
    };
    flexible.px2rem = function (d) {
      let val = parseFloat(d) / this.rem;
      if (typeof d === 'string' && d.match(/px$/)) {
        val += 'rem';
      }
      return val;
    };
  })(window, window.lib || (window.lib = {}));
};
export default pageSizeRem;
