(() => {
  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function set_custom_element_data(node, prop, value) {
    if (prop in node) {
      node[prop] = typeof node[prop] === "boolean" && value === "" ? true : value;
    } else {
      attr(node, prop, value);
    }
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function set_style(node, key, value, important) {
    if (value === null) {
      node.style.removeProperty(key);
    } else {
      node.style.setProperty(key, value, important ? "important" : "");
    }
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    if (flushidx !== 0) {
      return;
    }
    const saved_component = current_component;
    do {
      try {
        while (flushidx < dirty_components.length) {
          const component = dirty_components[flushidx];
          flushidx++;
          set_current_component(component);
          update(component.$$);
        }
      } catch (e) {
        dirty_components.length = 0;
        flushidx = 0;
        throw e;
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = /* @__PURE__ */ new Set();
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
          component.$$.on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        if (!is_function(callback)) {
          return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // webcomponents/index.js
  (() => {
    var re = Object.create;
    var z = Object.defineProperty;
    var ne = Object.getOwnPropertyDescriptor;
    var ie = Object.getOwnPropertyNames;
    var se = Object.getPrototypeOf, ae = Object.prototype.hasOwnProperty;
    var w = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
    var he = (e, t, r, n) => {
      if (t && typeof t == "object" || typeof t == "function")
        for (let i of ie(t))
          !ae.call(e, i) && i !== r && z(e, i, { get: () => t[i], enumerable: !(n = ne(t, i)) || n.enumerable });
      return e;
    };
    var E = (e, t, r) => (r = e != null ? re(se(e)) : {}, he(t || !e || !e.__esModule ? z(r, "default", { value: e, enumerable: true }) : r, e));
    var q = (e, t, r) => {
      if (!t.has(e))
        throw TypeError("Cannot " + r);
    };
    var x = (e, t, r) => (q(e, t, "read from private field"), r ? r.call(e) : t.get(e)), D = (e, t, r) => {
      if (t.has(e))
        throw TypeError("Cannot add the same private member more than once");
      t instanceof WeakSet ? t.add(e) : t.set(e, r);
    }, W = (e, t, r, n) => (q(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
    var O = w((xe, F) => {
      function oe(e) {
        var t = e[0], r = e[1] / 100, n = e[2] / 100, i, s;
        return n === 0 ? [0, 0, 0] : (n *= 2, r *= n <= 1 ? n : 2 - n, s = (n + r) / 2, i = 2 * r / (n + r), [t, i * 100, s * 100]);
      }
      F.exports = oe;
    });
    var B = w((_e, j) => {
      function le(e) {
        var t = e[0], r = e[1] / 100, n = e[2] / 100, i, s;
        return s = (2 - r) * n, i = r * n, i /= s <= 1 ? s : 2 - s, i = i || 0, s /= 2, [t, i * 100, s * 100];
      }
      j.exports = le;
    });
    var X = w((ye, G) => {
      function ue(e, t, r) {
        return Math.min(Math.max(e, t), r);
      }
      G.exports = ue;
    });
    var N = w((Ce, Y) => {
      var ce = X();
      function y(e) {
        var t = Math.round(ce(e, 0, 255)), r = t.toString(16);
        return r.length == 1 ? "0" + r : r;
      }
      function ve(e) {
        var t = e.length === 4 ? y(e[3] * 255) : "";
        return "#" + y(e[0]) + y(e[1]) + y(e[2]) + t;
      }
      Y.exports = ve;
    });
    var Q = w((He, K) => {
      function de(e) {
        for (var t = "#", r = 1; r < e.length; r++) {
          var n = e.charAt(r);
          t += n + n;
        }
        return t;
      }
      function pe(e) {
        (e.length === 4 || e.length === 5) && (e = de(e));
        var t = [parseInt(e.substring(1, 3), 16), parseInt(e.substring(3, 5), 16), parseInt(e.substring(5, 7), 16)];
        if (e.length === 9) {
          var r = parseFloat((parseInt(e.substring(7, 9), 16) / 255).toFixed(2));
          t.push(r);
        }
        return t;
      }
      K.exports = pe;
    });
    var V = E(O()), J = E(B());
    function M(e) {
      var t = e[0], r = e[1], n = e[2], i = Math.max(t, r, n), s = Math.min(t, r, n), o = i - s, l = o && 60 * (i === t ? (r - n) / o % 6 : i === r ? (n - t) / o + 2 : (t - r) / o + 4);
      return [l < 0 ? l + 360 : l, i && o * 100 / i, i * 100 / 255];
    }
    function k(e) {
      var t = e[0] / 60, r = e[1] / 100, n = e[2] / 100, i = n * r, s = i * (1 - Math.abs(t % 2 - 1)), o = n - i, l = (s + o) * 255 + 0.5 | 0, c = (i + o) * 255 + 0.5 | 0, a = o * 255 + 0.5 | 0, h = t | 0;
      return h === 1 ? [l, c, a] : h === 2 ? [a, c, l] : h === 3 ? [a, l, c] : h === 4 ? [l, a, c] : h === 5 ? [c, a, l] : [c, l, a];
    }
    var Z = E(N()), $ = E(Q());
    function T(e, t) {
      return e ? [R(e[0]) ? U(e[0]) : t[0], R(e[1]) ? C(e[1]) : t[1], R(e[2]) ? C(e[2]) : t[2]] : t;
    }
    function L(e) {
      return [U(e[0]), C(e[1]), C(e[2])];
    }
    function U(e) {
      var t = Math.round(e % 360 * 10) / 10;
      return t < 0 ? t + 360 : t;
    }
    function C(e) {
      return e < 0 ? 0 : e > 100 ? 100 : (e * 10 + 0.5 | 0) / 10;
    }
    function R(e) {
      return typeof e == "number" && isFinite(e);
    }
    var p = typeof globalThis != "undefined" ? globalThis : self;
    var H = "PointerEvent" in p ? function(e, t, r) {
      e.addEventListener("pointerdown", function(n) {
        n.button === 0 && t(n) !== false && this.setPointerCapture(n.pointerId);
      }), e.addEventListener("pointermove", function(n) {
        this.hasPointerCapture(n.pointerId) && r(n);
      });
    } : "ontouchend" in p ? function(e, t, r) {
      var n = false;
      e.addEventListener("touchstart", function(i) {
        i.touches.length === 1 && t(i.touches[0]) !== false && (n = true, i.preventDefault());
      }), e.addEventListener("touchmove", function(i) {
        n && i.touches.length === 1 && (i.preventDefault(), r(i.touches[0]));
      });
    } : function(e, t, r) {
      var n = function(s) {
        r(s);
      }, i = function() {
        removeEventListener("mouseup", i), removeEventListener("mousemove", n);
      };
      e.addEventListener("mousedown", function(s) {
        s.button === 0 && t(s) !== false && (addEventListener("mousemove", n), addEventListener("mouseup", i));
      });
    };
    var m = { hsv: [0, 100, 100], hsl: [0, 100, 50], wheelDiameter: 200, wheelThickness: 20, handleDiameter: 16, wheelReflectsSaturation: true, onChange: function() {
    } }, P = p.DOMMatrix || p.WebKitCSSMatrix || p.MSCSSMatrix, me = function(e) {
      for (var t = [e]; e = e.parentElement; )
        t.push(e);
      for (var r = new P(), n = t.length - 1; n >= 0; n--) {
        var i = getComputedStyle(t[n]), s = i.transform;
        if (s && s !== "none") {
          var o = i.transformOrigin.split(" ").map(parseFloat);
          r = r.translate(o[0], o[1]).multiply(new P(s)).translate(-o[0], -o[1]);
        }
      }
      return r.inverse();
    }, A = function(e, t) {
      return e === t || e[0] === t[0] && e[1] === t[1] && e[2] === t[2];
    }, fe = function() {
      function e(t) {
        var r = this;
        this.options = t, this.wheelDiameter = this.options.wheelDiameter || m.wheelDiameter, this.wheelThickness = this.options.wheelThickness || m.wheelThickness, this.handleDiameter = this.options.handleDiameter || m.handleDiameter, this.onChange = this.options.onChange || m.onChange, this.wheelReflectsSaturation = this.options.wheelReflectsSaturation !== void 0 ? this.options.wheelReflectsSaturation : m.wheelReflectsSaturation, this.rootElement = this.options.appendTo.appendChild(_("div", "reinvented-color-wheel")), this.hueWheelElement = this.rootElement.appendChild(_("canvas", "reinvented-color-wheel--hue-wheel")), this.hueWheelContext = this.hueWheelElement.getContext("2d"), this.hueHandleElement = this.rootElement.appendChild(_("div", "reinvented-color-wheel--hue-handle")), this.svSpaceElement = this.rootElement.appendChild(_("canvas", "reinvented-color-wheel--sv-space")), this.svSpaceContext = this.svSpaceElement.getContext("2d"), this.svHandleElement = this.rootElement.appendChild(_("div", "reinvented-color-wheel--sv-handle")), this._redrawHueWheel = function() {
          r._redrawHueWheelRequested = false;
          var a = r.wheelDiameter, h = a / 2, u = h - r.wheelThickness / 2, v = Math.PI / 180, d = r.wheelReflectsSaturation ? ",".concat(r._hsl[1], "%,").concat(r._hsl[2], "%)") : ",100%,50%)", g = r.hueWheelContext;
          g.clearRect(0, 0, a, a), g.lineWidth = r.wheelThickness;
          for (var b = 0; b < 360; b++)
            g.beginPath(), g.arc(h, h, u, (b - 90.7) * v, (b - 89.3) * v), g.strokeStyle = "hsl(" + b + d, g.stroke();
        }, this.hueWheelContext.imageSmoothingEnabled = false, this.svSpaceContext.imageSmoothingEnabled = false, this._hsv = T(t.hsv ? t.hsv : t.hsl ? e.hsl2hsv(t.hsl) : t.rgb ? e.rgb2hsv(t.rgb) : t.hex ? e.rgb2hsv(e.hex2rgb(t.hex)) : void 0, m.hsv), this._hsl = L(e.hsv2hsl(this._hsv)), this._rgb = e.hsv2rgb(this._hsv), this._hex = e.rgb2hex(this._rgb);
        var n = function(a, h) {
          var u = r._inverseTransform.multiply(new P("matrix(1,0,0,1,".concat(a, ",").concat(h, ")")));
          return { x: u.e, y: u.f };
        }, i = function(a) {
          r._inverseTransform = me(a);
          var h = a.getBoundingClientRect();
          r._center = n(h.left + h.width / 2, h.top + h.height / 2);
        }, s = function(a) {
          i(r.hueWheelElement);
          var h = n(a.clientX, a.clientY), u = h.x - r._center.x, v = h.y - r._center.y, d = r.wheelDiameter / 2 - r.wheelThickness;
          if (u * u + v * v < d * d)
            return false;
          o(a);
        }, o = function(a) {
          var h = n(a.clientX, a.clientY), u = h.x - r._center.x, v = h.y - r._center.y, d = Math.atan2(v, u);
          r.hsv = [d * 180 / Math.PI + 90, r.hsv[1], r.hsv[2]];
        }, l = function(a) {
          var h = n(a.clientX, a.clientY), u = 100 / r.svSpaceElement.width, v = (h.x - r._center.x) * u + 50, d = (r._center.y - h.y) * u + 50;
          r.hsv = [r._hsv[0], v, d];
        }, c = function(a) {
          i(r.svSpaceElement), l(a);
        };
        H(this.hueWheelElement, s, o), H(this.svSpaceElement, c, l), H(this.svHandleElement, c, l), this.redraw();
      }
      return Object.defineProperty(e.prototype, "hsv", { get: function() {
        return this._hsv;
      }, set: function(t) {
        A(this._hsv, t) || this._setHSV(t);
      }, enumerable: false, configurable: true }), Object.defineProperty(e.prototype, "hsl", { get: function() {
        return this._hsl;
      }, set: function(t) {
        A(this._hsl, t) || this._setHSV(e.hsl2hsv(t));
      }, enumerable: false, configurable: true }), Object.defineProperty(e.prototype, "rgb", { get: function() {
        return this._rgb;
      }, set: function(t) {
        A(this._rgb, t) || this._setHSV(e.rgb2hsv(t));
      }, enumerable: false, configurable: true }), Object.defineProperty(e.prototype, "hex", { get: function() {
        return this._hex;
      }, set: function(t) {
        this._hex !== t && (this.rgb = e.hex2rgb(t));
      }, enumerable: false, configurable: true }), e.prototype.setHSV = function() {
        this.hsv = arguments;
      }, e.prototype.setHSL = function() {
        this.hsl = arguments;
      }, e.prototype.redraw = function() {
        this.hueWheelElement.width = this.hueWheelElement.height = this.wheelDiameter, this.svSpaceElement.width = this.svSpaceElement.height = (this.wheelDiameter - this.wheelThickness * 2) * Math.SQRT1_2;
        var t = this.hueHandleElement.style, r = this.svHandleElement.style;
        t.width = t.height = r.width = r.height = "".concat(this.handleDiameter, "px"), t.marginLeft = t.marginTop = r.marginLeft = r.marginTop = "".concat(-this.handleDiameter / 2, "px"), this._redrawHueWheel(), this._redrawHueHandle(), this._redrawSvSpace(), this._redrawSvHandle();
      }, e.prototype._setHSV = function(t) {
        var r = this._hsv, n = this._hsv = T(t, r), i = r[0] - n[0], s = r[1] - n[1] || r[2] - n[2];
        i && (this._hsl = [n[0], this._hsl[1], this._hsl[2]], this._redrawHueHandle(), this._updateSvBackground()), s && (this._hsl = L(e.hsv2hsl(n)), this._redrawSvHandle(), this.wheelReflectsSaturation && !this._redrawHueWheelRequested && (requestAnimationFrame(this._redrawHueWheel), this._redrawHueWheelRequested = true)), (i || s) && (this._rgb = e.hsv2rgb(n), this._hex = e.rgb2hex(this._rgb), this.onChange(this));
      }, e.prototype._redrawSvSpace = function() {
        this._updateSvBackground();
        var t = this.svSpaceElement.width, r = this.svSpaceContext, n = r.createLinearGradient(0, 0, t, 0), i = r.createLinearGradient(0, 0, 0, t);
        n.addColorStop(0, "rgba(255,255,255,1)"), n.addColorStop(1, "rgba(255,255,255,0)"), i.addColorStop(0, "rgba(0,0,0,0)"), i.addColorStop(1, "rgba(0,0,0,1)"), r.fillStyle = n, r.fillRect(0, 0, t, t), r.fillStyle = i, r.fillRect(0, 0, t, t);
      }, e.prototype._updateSvBackground = function() {
        this.svSpaceElement.style.backgroundColor = "hsl(".concat(this._hsv[0], ",100%,50%)");
      }, e.prototype._redrawHueHandle = function() {
        var t = this.wheelDiameter / 2, r = t - this.wheelThickness / 2, n = (this._hsv[0] - 90) * Math.PI / 180, i = this.hueHandleElement.style;
        i.left = "".concat(r * Math.cos(n) + t, "px"), i.top = "".concat(r * Math.sin(n) + t, "px");
      }, e.prototype._redrawSvHandle = function() {
        var t = this.svSpaceElement.width, r = this.svHandleElement.style, n = (this.wheelDiameter - t) / 2, i = this._hsv;
        r.left = "".concat(n + t * i[1] / 100, "px"), r.top = "".concat(n + t * (1 - i[2] / 100), "px");
      }, e.default = e, e.defaultOptions = m, e.hsv2hsl = J.default, e.hsl2hsv = V.default, e.hsv2rgb = k, e.rgb2hsv = M, e.rgb2hex = Z.default, e.hex2rgb = $.default, e;
    }(), ee = fe;
    function _(e, t) {
      var r = document.createElement(e);
      return r.className = t, r;
    }
    var te = ".reinvented-color-wheel,.reinvented-color-wheel--hue-handle,.reinvented-color-wheel--hue-wheel,.reinvented-color-wheel--sv-handle,.reinvented-color-wheel--sv-space{touch-action:manipulation;touch-action:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.reinvented-color-wheel{position:relative;display:inline-block;line-height:0;border-radius:50%}.reinvented-color-wheel--hue-wheel{border-radius:50%}.reinvented-color-wheel--sv-space{position:absolute;left:0;top:0;right:0;bottom:0;margin:auto}.reinvented-color-wheel--hue-handle,.reinvented-color-wheel--sv-handle{position:absolute;box-sizing:border-box;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #000 inset}.reinvented-color-wheel--hue-handle{pointer-events:none}";
    var be = Object.freeze(["hsv", "hsl", "rgb", "hex", "wheel-diameter", "wheel-thickness", "handle-diameter", "wheel-reflects-saturation"]), f, S, I = class extends HTMLElement {
      constructor() {
        super();
        D(this, f, 0);
        D(this, S, () => {
          W(this, f, 1);
          try {
            let { colorWheel: r2 } = this;
            this.setAttribute("hsv", r2.hsv), this.setAttribute("hsl", r2.hsl), this.setAttribute("rgb", r2.rgb), this.setAttribute("hex", r2.hex);
          } finally {
            W(this, f, 0);
          }
        });
        let r = this.attachShadow({ mode: "open" });
        r.appendChild(document.createElement("style")).textContent = te, this.colorWheel = new ee({ appendTo: r, onChange: (n) => {
          x(this, S).call(this), this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: n }));
        } });
      }
      static get observedAttributes() {
        return be;
      }
      connectedCallback() {
        String(this.colorWheel.hex) !== this.getAttribute("hex") && x(this, S).call(this);
      }
      attributeChangedCallback(r, n, i) {
        let s = this.colorWheel;
        switch (r) {
          case "hex":
            x(this, f) || (s.hex = i);
            return;
          case "hsv":
          case "hsl":
          case "rgb":
            if (!x(this, f)) {
              let o = i.split(",").map((l) => +l);
              o[0] >= 0 && o[1] >= 0 && o[2] >= 0 && (s[r] = o);
            }
            return;
          case "wheel-diameter":
            s.wheelDiameter = +i, s.redraw();
            return;
          case "wheel-thickness":
            s.wheelThickness = +i, s.redraw();
            return;
          case "handle-diameter":
            s.handleDiameter = +i, s.redraw();
            return;
          case "wheel-reflects-saturation":
            s.wheelReflectsSaturation = i !== "false", s.redraw();
            return;
        }
      }
    };
    f = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new WeakMap();
    customElements.define("reinvented-color-wheel", I);
  })();

  // webcomponents/sample.svelte
  function create_fragment(ctx) {
    let main;
    let div;
    let label0;
    let t0;
    let br0;
    let t1;
    let input0;
    let t2;
    let label1;
    let t3;
    let br1;
    let t4;
    let input1;
    let input1_min_value;
    let input1_max_value;
    let t5;
    let label2;
    let t6;
    let br2;
    let t7;
    let input2;
    let input2_min_value;
    let input2_max_value;
    let t8;
    let label3;
    let t9;
    let br3;
    let t10;
    let input3;
    let input3_min_value;
    let input3_max_value;
    let t11;
    let label4;
    let input4;
    let t12;
    let t13;
    let reinvented_color_wheel;
    let mounted;
    let dispose;
    return {
      c() {
        main = element("main");
        div = element("div");
        label0 = element("label");
        t0 = text("hex");
        br0 = element("br");
        t1 = space();
        input0 = element("input");
        t2 = space();
        label1 = element("label");
        t3 = text("wheelDiameter");
        br1 = element("br");
        t4 = space();
        input1 = element("input");
        t5 = space();
        label2 = element("label");
        t6 = text("wheelThickness");
        br2 = element("br");
        t7 = space();
        input2 = element("input");
        t8 = space();
        label3 = element("label");
        t9 = text("handleDiameter");
        br3 = element("br");
        t10 = space();
        input3 = element("input");
        t11 = space();
        label4 = element("label");
        input4 = element("input");
        t12 = text("\n      wheelReflectsSaturation");
        t13 = space();
        reinvented_color_wheel = element("reinvented-color-wheel");
        attr(input0, "type", "color");
        attr(input1, "type", "range");
        attr(input1, "min", input1_min_value = 100);
        attr(input1, "max", input1_max_value = 1e3);
        set_style(label1, "margin-top", "16px");
        attr(input2, "type", "range");
        attr(input2, "min", input2_min_value = 2);
        attr(input2, "max", input2_max_value = /*wheelDiameter*/
        ctx[1] / 2);
        set_style(label2, "margin-top", "16px");
        attr(input3, "type", "range");
        attr(input3, "min", input3_min_value = 2);
        attr(input3, "max", input3_max_value = /*wheelDiameter*/
        ctx[1] / 2);
        set_style(label3, "margin-top", "16px");
        attr(input4, "type", "checkbox");
        set_style(label4, "margin-top", "16px");
        set_style(div, "flex", "none");
        set_style(div, "display", "flex");
        set_style(div, "flex-direction", "column");
        set_style(div, "align-items", "flex-start");
        set_style(div, "margin-right", "32px");
        set_custom_element_data(
          reinvented_color_wheel,
          "hex",
          /*hex*/
          ctx[0]
        );
        set_custom_element_data(
          reinvented_color_wheel,
          "wheel-diameter",
          /*wheelDiameter*/
          ctx[1]
        );
        set_custom_element_data(
          reinvented_color_wheel,
          "wheel-thickness",
          /*wheelThickness*/
          ctx[2]
        );
        set_custom_element_data(
          reinvented_color_wheel,
          "handle-diameter",
          /*handleDiameter*/
          ctx[3]
        );
        set_custom_element_data(
          reinvented_color_wheel,
          "wheel-reflects-saturation",
          /*wheelReflectsSaturation*/
          ctx[4]
        );
        set_style(main, "display", "flex");
      },
      m(target, anchor) {
        insert(target, main, anchor);
        append(main, div);
        append(div, label0);
        append(label0, t0);
        append(label0, br0);
        append(label0, t1);
        append(label0, input0);
        set_input_value(
          input0,
          /*hex*/
          ctx[0]
        );
        append(div, t2);
        append(div, label1);
        append(label1, t3);
        append(label1, br1);
        append(label1, t4);
        append(label1, input1);
        set_input_value(
          input1,
          /*wheelDiameter*/
          ctx[1]
        );
        append(div, t5);
        append(div, label2);
        append(label2, t6);
        append(label2, br2);
        append(label2, t7);
        append(label2, input2);
        set_input_value(
          input2,
          /*wheelThickness*/
          ctx[2]
        );
        append(div, t8);
        append(div, label3);
        append(label3, t9);
        append(label3, br3);
        append(label3, t10);
        append(label3, input3);
        set_input_value(
          input3,
          /*handleDiameter*/
          ctx[3]
        );
        append(div, t11);
        append(div, label4);
        append(label4, input4);
        input4.checked = /*wheelReflectsSaturation*/
        ctx[4];
        append(label4, t12);
        append(main, t13);
        append(main, reinvented_color_wheel);
        if (!mounted) {
          dispose = [
            listen(
              input0,
              "input",
              /*input0_input_handler*/
              ctx[5]
            ),
            listen(
              input1,
              "change",
              /*input1_change_input_handler*/
              ctx[6]
            ),
            listen(
              input1,
              "input",
              /*input1_change_input_handler*/
              ctx[6]
            ),
            listen(
              input2,
              "change",
              /*input2_change_input_handler*/
              ctx[7]
            ),
            listen(
              input2,
              "input",
              /*input2_change_input_handler*/
              ctx[7]
            ),
            listen(
              input3,
              "change",
              /*input3_change_input_handler*/
              ctx[8]
            ),
            listen(
              input3,
              "input",
              /*input3_change_input_handler*/
              ctx[8]
            ),
            listen(
              input4,
              "change",
              /*input4_change_handler*/
              ctx[9]
            ),
            listen(
              reinvented_color_wheel,
              "change",
              /*change_handler*/
              ctx[10]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*hex*/
        1) {
          set_input_value(
            input0,
            /*hex*/
            ctx2[0]
          );
        }
        if (dirty & /*wheelDiameter*/
        2) {
          set_input_value(
            input1,
            /*wheelDiameter*/
            ctx2[1]
          );
        }
        if (dirty & /*wheelDiameter*/
        2 && input2_max_value !== (input2_max_value = /*wheelDiameter*/
        ctx2[1] / 2)) {
          attr(input2, "max", input2_max_value);
        }
        if (dirty & /*wheelThickness*/
        4) {
          set_input_value(
            input2,
            /*wheelThickness*/
            ctx2[2]
          );
        }
        if (dirty & /*wheelDiameter*/
        2 && input3_max_value !== (input3_max_value = /*wheelDiameter*/
        ctx2[1] / 2)) {
          attr(input3, "max", input3_max_value);
        }
        if (dirty & /*handleDiameter*/
        8) {
          set_input_value(
            input3,
            /*handleDiameter*/
            ctx2[3]
          );
        }
        if (dirty & /*wheelReflectsSaturation*/
        16) {
          input4.checked = /*wheelReflectsSaturation*/
          ctx2[4];
        }
        if (dirty & /*hex*/
        1) {
          set_custom_element_data(
            reinvented_color_wheel,
            "hex",
            /*hex*/
            ctx2[0]
          );
        }
        if (dirty & /*wheelDiameter*/
        2) {
          set_custom_element_data(
            reinvented_color_wheel,
            "wheel-diameter",
            /*wheelDiameter*/
            ctx2[1]
          );
        }
        if (dirty & /*wheelThickness*/
        4) {
          set_custom_element_data(
            reinvented_color_wheel,
            "wheel-thickness",
            /*wheelThickness*/
            ctx2[2]
          );
        }
        if (dirty & /*handleDiameter*/
        8) {
          set_custom_element_data(
            reinvented_color_wheel,
            "handle-diameter",
            /*handleDiameter*/
            ctx2[3]
          );
        }
        if (dirty & /*wheelReflectsSaturation*/
        16) {
          set_custom_element_data(
            reinvented_color_wheel,
            "wheel-reflects-saturation",
            /*wheelReflectsSaturation*/
            ctx2[4]
          );
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(main);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let hex = "#ff3e00";
    let wheelDiameter = 300;
    let wheelThickness = 30;
    let handleDiameter = 20;
    let wheelReflectsSaturation = true;
    function input0_input_handler() {
      hex = this.value;
      $$invalidate(0, hex);
    }
    function input1_change_input_handler() {
      wheelDiameter = to_number(this.value);
      $$invalidate(1, wheelDiameter);
    }
    function input2_change_input_handler() {
      wheelThickness = to_number(this.value);
      $$invalidate(2, wheelThickness);
    }
    function input3_change_input_handler() {
      handleDiameter = to_number(this.value);
      $$invalidate(3, handleDiameter);
    }
    function input4_change_handler() {
      wheelReflectsSaturation = this.checked;
      $$invalidate(4, wheelReflectsSaturation);
    }
    const change_handler = (e) => $$invalidate(0, hex = e.detail.hex);
    return [
      hex,
      wheelDiameter,
      wheelThickness,
      handleDiameter,
      wheelReflectsSaturation,
      input0_input_handler,
      input1_change_input_handler,
      input2_change_input_handler,
      input3_change_input_handler,
      input4_change_handler,
      change_handler
    ];
  }
  var Sample = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, {});
    }
  };
  var sample_default = Sample;

  // <stdin>
  new sample_default({ target: document.body });
})();
