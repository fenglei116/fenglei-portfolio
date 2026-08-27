/* ============================================================
   ParticleText — 原生 Canvas 粒子文字
   文字 → 粒子点阵，从散开位置聚集成形，带鼠标斥力 / 漂浮 / 发光
   ============================================================ */
(function (global) {
  'use strict'

  const DPR = Math.min(2, global.devicePixelRatio || 1)

  class ParticleText {
    constructor(el, opts) {
      this.el = el
      this.opts = Object.assign(
        {
          text: 'FUTURE',
          particleSize: 2.2,
          density: 4,
          color: '#f8fafc',
          highlightColor: '#8b5cf6',
          scatter: 190,
          gatherDuration: 1600,
          stagger: 420,
          pointerRepel: 42,
          repelRadius: 120,
          idleDrift: 0.8,
          glow: true,
          fontSize: 'clamp(3rem, 10vw, 7rem)',
          fontWeight: 800,
          fontFamily: "'Impact','Arial Black','Helvetica Neue',Arial,sans-serif",
        },
        opts || {},
      )

      this.particles = []
      this.mouse = { x: -9999, y: -9999, active: false }
      this.raf = null
      this.startTime = 0
      this.hover = false

      this.build()
    }

    build() {
      const el = this.el
      el.classList.add('particle-text')

      this.canvas = document.createElement('canvas')
      this.canvas.className = 'particle-text__canvas'
      el.appendChild(this.canvas)
      this.ctx = this.canvas.getContext('2d', { alpha: true })

      // 无障碍：隐藏原始文本
      const sr = document.createElement('span')
      sr.className = 'particle-text__sr'
      sr.textContent = this.opts.text
      el.appendChild(sr)

      // 视口尺寸（容器）
      this.resize()
      global.addEventListener('resize', () => this.resize())

      // 鼠标
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect()
        this.mouse.x = e.clientX - r.left
        this.mouse.y = e.clientY - r.top
        this.mouse.active = true
      })
      el.addEventListener('pointerleave', () => {
        this.mouse.x = -9999
        this.mouse.y = -9999
      })

      this.sampleText()
      this.startTime = performance.now()
      this.loop()
    }

    resize() {
      const w = this.el.clientWidth || this.el.parentElement.clientWidth || 600
      const h = this.el.clientHeight || 360
      this.width = w
      this.height = h
      this.canvas.width = Math.round(w * DPR)
      this.canvas.height = Math.round(h * DPR)
      this.canvas.style.width = w + 'px'
      this.canvas.style.height = h + 'px'
      this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      if (this.particles.length) this.sampleText()
    }

    /* 离屏采样文字形状 → 粒子目标点 */
    sampleText() {
      const { text, density, fontSize, fontWeight, fontFamily } = this.opts
      const off = document.createElement('canvas')
      const ctx = off.getContext('2d')

      // 解析 clamp() 字号：取中间值（近似容器宽度 * vw 系数）
      let px = 64
      const m = String(fontSize).match(/[\d.]+vw/)
      if (m) px = (parseFloat(m[0]) * this.width) / 100
      const m2 = String(fontSize).match(/[\d.]+rem/)
      if (m2) px = Math.max(px, parseFloat(m2[0]) * 16)

      const lines = String(text).split('\n')
      ctx.font = `${fontWeight} ${px}px ${fontFamily}`
      const lineHeight = px * 1.08
      const maxW = Math.max.apply(
        null,
        lines.map((l) => ctx.measureText(l).width),
      )

      off.width = Math.ceil(maxW) + 4
      off.height = Math.ceil(lineHeight * lines.length) + 4
      ctx.font = `${fontWeight} ${px}px ${fontFamily}`
      ctx.fillStyle = '#fff'
      ctx.textBaseline = 'alphabetic'
      lines.forEach((line, i) => {
        ctx.fillText(line, 2, px + i * lineHeight)
      })

      // 采样
      const img = ctx.getImageData(0, 0, off.width, off.height).data
      const step = Math.max(1, Math.round(density))
      const targets = []
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (img[(y * off.width + x) * 4 + 3] > 128) {
            targets.push({
              x: x - off.width / 2,
              y: y - off.height / 2,
              seed: Math.random(),
            })
          }
        }
      }

      // 目标位置居中于容器
      const cx = this.width / 2
      const cy = this.height / 2
      this.particles = targets.map((t) => {
        const ang = Math.random() * Math.PI * 2
        const dist = Math.random() * this.opts.scatter
        return {
          tx: cx + t.x,
          ty: cy + t.y,
          x: cx + t.x + Math.cos(ang) * dist,
          y: cy + t.y + Math.sin(ang) * dist,
          delay: Math.random() * this.opts.stagger,
          seed: t.seed,
          size:
            this.opts.particleSize * (0.75 + Math.random() * 0.5),
          // 高亮色粒子（随机 12%）
          hl: Math.random() < 0.12,
        }
      })
    }

    /* 动画主循环 */
    loop() {
      const t = performance.now()
      const elapsed = t - this.startTime
      const ctx = this.ctx
      const { particleSize, pointerRepel, repelRadius, idleDrift, glow, gatherDuration, highlightColor, color } =
        this.opts

      ctx.clearRect(0, 0, this.width, this.height)

      // 发光：一次性给 canvas 设置 shadow（所有粒子共享）
      ctx.shadowBlur = glow ? 8 : 0
      ctx.shadowColor = highlightColor

      for (const p of this.particles) {
        // gather 缓动：滞后延迟 + 指数趋近
        const d = Math.max(0, elapsed - p.delay)
        const k = 1 - Math.exp(-d / (gatherDuration * 0.6))

        // idle drift 漂浮
        const driftX = Math.sin(elapsed * 0.0005 + p.seed * 100) * idleDrift
        const driftY = Math.cos(elapsed * 0.0006 + p.seed * 137) * idleDrift

        let tx = p.tx + driftX
        let ty = p.ty + driftY

        // 鼠标斥力
        const dx = p.x - this.mouse.x
        const dy = p.y - this.mouse.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < repelRadius * repelRadius) {
          const dist = Math.sqrt(dist2) || 1
          const force = ((repelRadius - dist) / repelRadius) * pointerRepel
          tx += (dx / dist) * force
          ty += (dy / dist) * force
        }

        p.x += (tx - p.x) * k
        p.y += (ty - p.y) * k

        ctx.fillStyle = p.hl ? highlightColor : color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      this.raf = requestAnimationFrame(() => this.loop())
    }

    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf)
      this.el.innerHTML = ''
    }
  }

  global.ParticleText = ParticleText

  // 自动初始化：匹配 [data-particle-text]，属性 text 取元素属性或内容
  function autoInit() {
    document.querySelectorAll('[data-particle-text]').forEach((el) => {
      if (el.__particleText) return
      const text = el.getAttribute('data-particle-text') || el.textContent.trim()
      el.__particleText = new ParticleText(el, { text })
    })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit)
  } else {
    autoInit()
  }
})(window)
