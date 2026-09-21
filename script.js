/* ============================================================
   FENGLEI® — Bike Bear 风格作品集 · 动效逻辑
   GSAP + ScrollTrigger + Lenis（本地 vendor）
   ============================================================ */

(function () {
  'use strict'

  const hasGsap = typeof gsap !== 'undefined'
  const hasLenis = typeof Lenis !== 'undefined'
  const isTouch = window.matchMedia('(hover: none)').matches

  /* ---------- Lenis 平滑滚动 + ScrollTrigger 联动 ---------- */
  if (hasLenis && hasGsap) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    window.addEventListener('menuopen', () => lenis.stop())
    window.addEventListener('menuclose', () => lenis.start())

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href')
        if (id && id.length > 1) {
          const target = document.querySelector(id)
          if (target) {
            e.preventDefault()
            lenis.scrollTo(target, { offset: 0, duration: 1.4 })
            closeMenu()
          }
        }
      })
    })
  } else {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href')
        const target = id && id.length > 1 ? document.querySelector(id) : null
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth' })
          closeMenu()
        }
      })
    })
  }

  /* ---------- 滚动进度条 ---------- */
  const progressBar = document.querySelector('.progress-bar')
  function updateProgress() {
    const t = document.documentElement.scrollTop
    const m = document.documentElement.scrollHeight - window.innerHeight
    progressBar.style.height = (m > 0 ? (t / m) * 100 : 0) + '%'
  }
  window.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true })
  updateProgress()

  /* ---------- Header 滚动态（logo 翻色） ---------- */
  const siteHeader = document.getElementById('siteHeader')
  function updateHeader() {
    const onDark = window.scrollY > 200
    siteHeader.classList.toggle('is-scrolled', onDark)
  }
  window.addEventListener('scroll', () => requestAnimationFrame(updateHeader), { passive: true })
  updateHeader()

  /* ---------- LogoLoop 无缝：克隆 track 内容一份，-50% 循环 ---------- */
  document.querySelectorAll('.clients-track').forEach((track) => {
    track.innerHTML += track.innerHTML
  })

  /* ---------- 全屏 MENU ---------- */
  const menuBtn = document.getElementById('menuBtn')
  const menu = document.getElementById('fullscreenMenu')
  let menuOpen = false
  function openMenu() {
    menuOpen = true
    menu.classList.add('is-open')
    menuBtn.classList.add('is-open')
    menu.setAttribute('aria-hidden', 'false')
    document.dispatchEvent(new CustomEvent('menuopen'))
  }
  function closeMenu() {
    if (!menuOpen) return
    menuOpen = false
    menu.classList.remove('is-open')
    menuBtn.classList.remove('is-open')
    menu.setAttribute('aria-hidden', 'true')
    document.dispatchEvent(new CustomEvent('menuclose'))
  }
  // 菜单内容可滚动：绕过 Lenis 对 wheel 的拦截，直接用原生 scrollTop
  menu.addEventListener('wheel', (e) => {
    menu.scrollTop += e.deltaY
    e.preventDefault()
  }, { passive: false })
  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))
  window.closeMenu = closeMenu

    /* ---------- DriftWall 弹窗（UI DESIGN 详情 · 动态生成） ---------- */
  const driftModal = document.getElementById('driftModal')
  const driftClose = document.getElementById('driftModalClose')
  const driftWall = document.getElementById('driftWall')
  let driftCancel = null
  if (driftModal && driftWall) {
    const driftItems = {
      ui: [
        'assets/ui/frame-1.webp','assets/ui/frame-2.webp','assets/ui/frame-3.webp','assets/ui/frame-4.webp',
        'assets/ui/frame-5.webp','assets/ui/frame-6.webp','assets/ui/frame-7.webp','assets/ui/frame-8.webp',
        'assets/ui/frame-9.webp','assets/ui/frame-10.webp','assets/ui/frame-11.webp','assets/ui/frame-12.webp',
        'assets/ui/frame-13.webp','assets/ui/frame-14.webp','assets/ui/frame-15.webp','assets/ui/frame-16.webp',
        'assets/ui/frame-17.webp','assets/ui/frame-18.webp',
      ],
      ux: [
        'assets/ux/ux-1.webp','assets/ux/ux-2.webp','assets/ux/ux-3.webp','assets/ux/ux-4.webp','assets/ux/ux-5.webp',
      ],
      vibe: [
        'assets/vibe/vibe-0.webp','assets/vibe/vibe-1.webp','assets/vibe/vibe-2.webp','assets/vibe/vibe-3.webp',
        'assets/vibe/vibe-4.webp','assets/vibe/vibe-5.webp','assets/vibe/vibe-6.webp','assets/vibe/vibe-7.webp',
        'assets/vibe/vibe-8.webp','assets/vibe/vibe-9.webp','assets/vibe/vibe-10.webp','assets/vibe/vibe-11.webp',
        'assets/vibe/vibe-12.webp','assets/vibe/vibe-13.webp',
      ],
    }
    function openDriftWall(source) {
      try {
        if (driftCancel) driftCancel()
        driftCancel = buildDriftWall(driftWall, driftItems[source] || driftItems.ui)
        driftModal.classList.add('is-open')
        driftModal.setAttribute('aria-hidden', 'false')
        document.dispatchEvent(new CustomEvent('menuopen'))
      } catch (err) {
        driftWall.innerHTML =
          '<div style="color:#fff;font-family:monospace;padding:48px 32px;font-size:14px">' +
          'ERROR: ' + (err && err.message ? err.message : err) + '<br/><br/>' +
          (err && err.stack ? err.stack.replace(/\n/g, '<br/>') : '') +
          '</div>'
        driftModal.classList.add('is-open')
      }
    }
    function closeDrift() {
      if (driftCancel) driftCancel()
      driftCancel = null
      driftModal.classList.remove('is-open')
      driftModal.setAttribute('aria-hidden', 'true')
      driftWall.innerHTML = ''
      document.dispatchEvent(new CustomEvent('menuclose'))
    }
    document.querySelectorAll('[data-drift-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return
        openDriftWall(el.getAttribute('data-drift-source') || 'ui')
      })
    })
    if (driftClose) driftClose.addEventListener('click', closeDrift)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && driftModal.classList.contains('is-open')) closeDrift()
    })
  }

/* ---------- 简历弹窗（About "查看简历" 触发） ---------- */
  const resumeModal = document.getElementById('resumeModal')
  const resumeClose = document.getElementById('resumeModalClose')
  const resumeImg = document.getElementById('resumeImg')
  const resumePrev = document.getElementById('resumePrev')
  const resumeNext = document.getElementById('resumeNext')
  const resumeInfo = document.getElementById('resumeInfo')
  const RESUME_PAGES = [
    'assets/resume/r-1.webp?v=20260921-2130',
    'assets/resume/r-2.webp?v=20260921-2130',
  ]
  let resumePage = 1
  function showResumePage(n) {
    n = Math.max(1, Math.min(n, RESUME_PAGES.length))
    const dir = n > resumePage ? 'next' : n < resumePage ? 'prev' : null
    resumePage = n
    if (dir) {
      // 旧图滑出（方向决定滑向哪边）
      resumeImg.classList.add('is-leaving')
      resumeImg.classList.toggle('is-left', dir === 'next')
      resumeImg.classList.toggle('is-right', dir === 'prev')
      setTimeout(() => {
        resumeImg.src = RESUME_PAGES[n - 1]
        resumeImg.classList.remove('is-leaving', 'is-left', 'is-right')
        // 新图滑入（反向）
        resumeImg.classList.add(dir === 'next' ? 'is-entering-left' : 'is-entering-right')
        resumeImg.addEventListener('animationend', function h() {
          resumeImg.classList.remove('is-entering-left', 'is-entering-right')
          resumeImg.removeEventListener('animationend', h)
        })
        resumeInfo.textContent = n + ' / ' + RESUME_PAGES.length
        resumePrev.disabled = n <= 1
        resumeNext.disabled = n >= RESUME_PAGES.length
      }, 200)
    } else {
      resumeImg.src = RESUME_PAGES[n - 1]
    }
  }
  function openResume() {
    resumeModal.classList.add('is-open')
    resumeModal.setAttribute('aria-hidden', 'false')
    showResumePage(1)
    document.dispatchEvent(new CustomEvent('menuopen'))
  }
  function closeResume() {
    resumeModal.classList.remove('is-open')
    resumeModal.setAttribute('aria-hidden', 'true')
    document.dispatchEvent(new CustomEvent('menuclose'))
  }
  document.querySelectorAll('[data-resume-link]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      openResume()
    })
  })
  if (resumeClose) resumeClose.addEventListener('click', closeResume)
  if (resumePrev) resumePrev.addEventListener('click', () => showResumePage(resumePage - 1))
  if (resumeNext) resumeNext.addEventListener('click', () => showResumePage(resumePage + 1))
  if (resumeModal) resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResume()
  })
  document.addEventListener('keydown', (e) => {
    if (resumeModal && resumeModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeResume()
      if (e.key === 'ArrowLeft') showResumePage(resumePage - 1)
      if (e.key === 'ArrowRight') showResumePage(resumePage + 1)
    }
  })

  /* ---------- Contact 弹窗（Footer GO 触发） ---------- */
  const contactModal = document.getElementById('contactModal')
  const contactClose = document.getElementById('contactModalClose')
  if (contactModal) {
    function openContact() {
      contactModal.classList.add('is-open')
      contactModal.setAttribute('aria-hidden', 'false')
      // 弹窗可见后重新测量光线 canvas（display:none 时量不到尺寸）
      if (window.__lrResize) window.__lrResize()
      document.dispatchEvent(new CustomEvent('menuopen'))
    }
    function closeContact() {
      contactModal.classList.remove('is-open')
      contactModal.setAttribute('aria-hidden', 'true')
      document.dispatchEvent(new CustomEvent('menuclose'))
    }
    document.querySelectorAll('[data-contact-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        openContact()
      })
    })
    if (contactClose) contactClose.addEventListener('click', closeContact)
    // 点击卡片外部（遮罩区域）→ 关闭
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeContact()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal.classList.contains('is-open')) closeContact()
    })
  }

  /* ---------- 大图 Lightbox（DriftWall tile 点击查看大图） ---------- */
  const lightboxModal = document.getElementById('lightboxModal')
  const lightboxImg = document.getElementById('lightboxImg')
  const lightboxClose = document.getElementById('lightboxClose')
  if (lightboxModal && lightboxImg) {
    window.openLightbox = function (src) {
      lightboxImg.src = src
      // 从路径提取信息条文字：assets/ui/frame-3.png → "UI DESIGN · FRAME 03"
      const cap = document.getElementById('lightboxCaption')
      if (cap) {
        const parts = src.split('/')
        const file = parts[parts.length - 1].replace(/\.[a-z]+$/i, '')
        const folder = parts[parts.length - 2] || ''
        const label = {
          ui: 'UI DESIGN',
          ux: 'UX DESIGN',
          vibe: 'VIBE CODING',
        }[folder] || folder.toUpperCase()
        cap.textContent = label + ' · ' + file.replace(/[-_]/g, ' ').toUpperCase()
      }
      lightboxModal.classList.add('is-open')
      lightboxModal.setAttribute('aria-hidden', 'false')
      document.dispatchEvent(new CustomEvent('menuopen'))
    }
    function closeLightbox() {
      lightboxModal.classList.remove('is-open')
      lightboxModal.setAttribute('aria-hidden', 'true')
      lightboxImg.src = ''
      document.dispatchEvent(new CustomEvent('menuclose'))
    }
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox)
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('is-open')) closeLightbox()
    })
  }

  /* ---------- LightRays 顶部光线动效（contact 弹窗氛围光） ---------- */
  function initLightRays() {
    const container = document.getElementById('contactLightRays')
    if (!container) return
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0
    let mouseX = 0, mouseY = 0

    function resize() {
      const r = container.getBoundingClientRect()
      w = r.width || 1
      h = r.height || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.__lrResize = resize      // 弹窗打开时重新测量（display:none 时量到 0）
    window.addEventListener('resize', resize)
    container.addEventListener('pointermove', (e) => {
      const r = container.getBoundingClientRect()
      mouseX = e.clientX - r.left - r.width / 2
      mouseY = e.clientY - r.top - r.height / 2
    })
    container.addEventListener('pointerleave', () => { mouseX = 0; mouseY = 0 })

    // 40 条白色光线从顶部中心向下发散（更集中 + 更亮）
    const RAY_COUNT = 40
    const rays = []
    for (let i = 0; i < RAY_COUNT; i++) {
      rays.push({
        angle: (Math.random() - 0.5) * Math.PI * 0.62,  // 散开 ±0.31π（更窄更聚拢）
        length: h * (1.5 + Math.random() * 1.5),       // 光线长度
        opacity: 0.18 + Math.random() * 0.26,          // 0.18~0.44（明显可见）
      })
    }

    function loop() {
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = 0
      // 鼠标轻微影响（mouseInfluence 0.1 → 视觉上很轻）
      const mx = mouseX * 0.04
      rays.forEach((r) => {
        const a = r.angle + mx * 0.004
        const dx = Math.sin(a) * r.length
        const dy = Math.cos(a) * r.length
        const grad = ctx.createLinearGradient(cx, cy, cx + dx, cy + dy)
        grad.addColorStop(0, `rgba(255,255,255,${r.opacity})`)
        grad.addColorStop(0.5, `rgba(255,255,255,${r.opacity * 0.35})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(cx + mouseY * 0.15, cy)
        ctx.lineTo(cx + dx + mouseY * 0.15, cy + dy)
        ctx.stroke()
      })
      requestAnimationFrame(loop)
    }
    loop()
  }
  initLightRays()

    /* ---------- LineSidebar 动效（全屏菜单：靠近变色 + 位移 + marker 生长） ---------- */
  function initMenuLineEffect() {
    const links = document.querySelectorAll('.menu-list .menu-link')
    if (!links.length) return
    const PROX = 100
    const MAX_SHIFT = 30
    links.forEach((link) => {
      link.style.setProperty('--effect', 0)
      // 关键：JS rAF 每帧驱动 transform，必须禁用 CSS transform 过渡（否则永远追不上）
      link.style.transition = 'font-style 0.35s'
      // 插入左侧 marker 线
      const marker = document.createElement('span')
      marker.className = 'ls-marker'
      link.insertBefore(marker, link.firstChild)
    })
    let mx = -9999, my = -9999
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY }, { passive: true })
    function raf() {
      links.forEach((link) => {
        const r = link.getBoundingClientRect()
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
        const target = d < PROX ? 1 - d / PROX : 0
        const cur = parseFloat(link.style.getPropertyValue('--effect')) || 0
        const next = cur + (target - cur) * 0.14
        // 只更新 --effect，transform 由 CSS 计算（更可靠，无 transform 覆盖冲突）
        link.style.setProperty('--effect', next)
        const li = link.closest('li')
        if (li) li.style.setProperty('--effect', next)
      })
      requestAnimationFrame(raf)
    }
    raf()
  }
  initMenuLineEffect()

  /* ---------- Skills Accordion ---------- */
  document.querySelectorAll('.service-item').forEach((item) => {
    if (isTouch) {
      item.addEventListener('click', () => {
        if (item.hasAttribute('data-drift-link')) return // UI DESIGN 走 DriftWall 弹窗
        const wasActive = item.classList.contains('active')
        document.querySelectorAll('.service-item.active').forEach((el) => el.classList.remove('active'))
        if (!wasActive) item.classList.add('active')
      })
    } else {
      item.addEventListener('mouseenter', () => {
        if (item.hasAttribute('data-drift-link')) return // UI DESIGN 走 DriftWall 弹窗
        item.classList.add('active')
      })
      item.addEventListener('mouseleave', () => {
        if (item.hasAttribute('data-drift-link')) return
        item.classList.remove('active')
      })
    }
  })

  /* ---------- About 角色彩蛋 ---------- */
  const aboutChar = document.getElementById('aboutChar')
  if (aboutChar) {
    aboutChar.addEventListener('click', () => {
      aboutChar.classList.remove('is-bounce')
      void aboutChar.offsetWidth
      aboutChar.classList.add('is-bounce')
    })
  }

  /* ---------- PDF 预览弹窗（页面内图片翻页阅读器） ---------- */
  const pdfModal = document.getElementById('pdfModal')
  const pdfClose = document.getElementById('pdfModalClose')
  const pdfViewer = document.getElementById('pdfViewer')
  const pdfImg = document.getElementById('pdfImg')
  const pdfPrev = document.getElementById('pdfPrev')
  const pdfNext = document.getElementById('pdfNext')
  const pdfPageInfo = document.getElementById('pdfPageInfo')
  // PDF → 页面 WebP 图片序列映射（每页懒加载，秒开）
  const PDF_IMAGES = {
    'assets/project-1-case.pdf': { prefix: 'p1', pages: 20 },
    'assets/project-2-case.pdf': { prefix: 'p2', pages: 14 },
  }
  const PDF_ASSET_VERSION = '20260921-2157'
  let pdfMeta = null
  let pdfPageNum = 1

  function showPdfPage(n) {
    if (!pdfMeta) return
    n = Math.max(1, Math.min(n, pdfMeta.pages))
    pdfPageNum = n
    pdfImg.src = 'assets/pdf/' + pdfMeta.prefix + '-' + String(n).padStart(2, '0') + '.webp?v=' + PDF_ASSET_VERSION
    pdfImg.alt = '案例第 ' + n + ' 页'
    pdfPageInfo.textContent = n + ' / ' + pdfMeta.pages
    pdfPrev.disabled = n <= 1
    pdfNext.disabled = n >= pdfMeta.pages
    pdfViewer.scrollTop = 0
  }

  function openPdf(href) {
    pdfMeta = PDF_IMAGES[href]
    if (!pdfMeta) {
      pdfViewer && (pdfViewer.innerHTML = '<p style="color:#fff;padding:40px;text-align:center">该文档暂未收录</p>')
      pdfModal.classList.add('is-open')
      pdfModal.setAttribute('aria-hidden', 'false')
      document.dispatchEvent(new CustomEvent('menuopen'))
      return
    }
    pdfModal.classList.add('is-open')
    pdfModal.setAttribute('aria-hidden', 'false')
    document.dispatchEvent(new CustomEvent('menuopen')) // 锁背景滚动
    showPdfPage(1)
  }
  function closePdf() {
    pdfModal.classList.remove('is-open')
    pdfModal.setAttribute('aria-hidden', 'true')
    pdfMeta = null
    pdfImg.src = ''
    document.dispatchEvent(new CustomEvent('menuclose'))
  }
  document.querySelectorAll('[data-pdf-preview]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      openPdf(a.getAttribute('href'))
    })
  })
  if (pdfClose) pdfClose.addEventListener('click', closePdf)
  if (pdfPrev) pdfPrev.addEventListener('click', () => showPdfPage(pdfPageNum - 1))
  if (pdfNext) pdfNext.addEventListener('click', () => showPdfPage(pdfPageNum + 1))
  pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) closePdf()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdfModal.classList.contains('is-open')) closePdf()
    if (e.key === 'ArrowLeft' && pdfModal.classList.contains('is-open')) showPdfPage(pdfPageNum - 1)
    if (e.key === 'ArrowRight' && pdfModal.classList.contains('is-open')) showPdfPage(pdfPageNum + 1)
  })

  /* ---------- SpecularButton：圆角边框 + 鼠标跟随光扫（原生 canvas 版） ---------- */
  class SpecularButton {
    constructor(el) {
      this.el = el
      this.fx = document.createElement('div')
      this.fx.className = 'specular-button__fx'
      this.canvas = document.createElement('canvas')
      this.fx.appendChild(this.canvas)
      el.appendChild(this.fx)
      this.ctx = this.canvas.getContext('2d')
      this.dpr = Math.min(2, window.devicePixelRatio || 1)
      this.mx = -9999
      this.my = -9999
      this.active = false
      this.radius = 14            // 按钮圆角
      this.pad = 20               // canvas 延伸量
      this.resize()
      window.addEventListener('resize', () => this.resize())
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect()
        this.mx = e.clientX - r.left
        this.my = e.clientY - r.top
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        this.active = Math.hypot(e.clientX - cx, e.clientY - cy) < 250 // proximity
      })
      el.addEventListener('pointerleave', () => {
        this.mx = -9999
        this.active = false
      })
      this.loop()
    }
    resize() {
      const r = this.el.getBoundingClientRect()
      this.w = r.width + this.pad * 2
      this.h = r.height + this.pad * 2
      this.canvas.width = this.w * this.dpr
      this.canvas.height = this.h * this.dpr
      this.canvas.style.width = this.w + 'px'
      this.canvas.style.height = this.h + 'px'
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    }
    loop() {
      const ctx = this.ctx
      const t = performance.now()
      ctx.clearRect(0, 0, this.w, this.h)
      const x = this.pad
      const y = this.pad
      const w = this.w - this.pad * 2
      const h = this.h - this.pad * 2

      // 圆角矩形路径
      const path = () => {
        ctx.beginPath()
        ctx.moveTo(x + this.radius, y)
        ctx.arcTo(x + w, y, x + w, y + h, this.radius)
        ctx.arcTo(x + w, y + h, x, y + h, this.radius)
        ctx.arcTo(x, y + h, x, y, this.radius)
        ctx.arcTo(x, y, x + w, y, this.radius)
        ctx.closePath()
      }

      // 外发光（激活时随鼠标距离增强）
      const glow = this.active
        ? Math.min(1, Math.max(0, (250 - Math.hypot(this.mx - w / 2, this.my - h / 2)) / 250))
        : 0
      if (glow > 0.02) {
        ctx.save()
        path()
        ctx.clip()
        const gx = this.mx >= 0 ? this.mx : w / 2
        const gy = this.my >= 0 ? this.my : h / 2
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 90)
        g.addColorStop(0, 'rgba(255,255,255,' + 0.28 * glow + ')')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(x, y, w, h)
        ctx.restore()
      }

      // 边框（激活时变亮）
      path()
      ctx.strokeStyle = this.active ? 'rgba(255,255,255,' + (0.75 + glow * 0.25) + ')' : 'rgba(255,255,255,0.28)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // 光扫：垂直亮线跟随鼠标 x（inactive 时按 sin 自动扫过）
      let sx
      if (this.active && this.mx >= 0) {
        sx = this.mx
      } else {
        sx = x + ((Math.sin(t * 0.0016) + 1) / 2) * w
      }
      ctx.save()
      path()
      ctx.clip()
      const grad = ctx.createLinearGradient(sx - 8, 0, sx + 8, 0)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.5, 'rgba(255,255,255,' + (0.16 + glow * 0.5) + ')')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(sx - 8, y, 16, h)
      ctx.restore()

      requestAnimationFrame(() => this.loop())
    }
  }

  if (!isTouch) {
    document.querySelectorAll('[data-specular]').forEach((el) => new SpecularButton(el))
  }

  /* ---------- 磁性按钮 ---------- */
  document.querySelectorAll('.button-interactive').forEach((btn) => {
    if (isTouch) return
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect()
      const dx = Math.max(-8, Math.min(8, e.clientX - r.left - r.width / 2 - 10))
      const dy = Math.max(-8, Math.min(8, e.clientY - r.top - r.height / 2 - 10))
      btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'
      btn.style.filter = 'drop-shadow(' + -dx + 'px ' + -dy + 'px 0 var(--green))'
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)'
      btn.style.filter = 'drop-shadow(0 0 0 var(--green))'
    })
  })

  /* ---------- 自定义光标 ---------- */
  const cursor = document.getElementById('cursor')
  if (!isTouch) {
    let mx = 0, my = 0, cx = 0, cy = 0
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY })
    if (hasGsap) {
      gsap.ticker.add(() => {
        cx += (mx - cx) * 0.22
        cy += (my - cy) * 0.22
        gsap.set(cursor, { x: cx, y: cy })
      })
    } else {
      window.addEventListener('mousemove', (e) => {
        cursor.style.transform = 'translate(' + (e.clientX - 7) + 'px,' + (e.clientY - 7) + 'px)'
      })
    }
    document.addEventListener('mouseover', (e) => {
      const hit = e.target.closest('[data-cursor="view"]')
      cursor.classList.toggle('is-view', !!hit)
    })
  }

  /* ============================================================
     DriftWall 弹窗构建函数（IIFE 顶层定义，不依赖 GSAP 加载状态）
     ============================================================ */
  const DRIFT_COLUMN_COUNT = 9

  function buildDriftWall(wall, items) {
    wall.innerHTML = ''
    const plane = document.createElement('div')
    plane.className = 'drift-wall__plane'
    plane.id = 'driftPlane'

    // Fisher-Yates 乱序
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    // 9 列：所有列同一平面（不设深度 → 透视下列间距一致）
    const depths = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    const cols = []
    // 先把 items 整体打乱一次 → 9 列切 4-tile 块（更均匀的列分布，相邻列也不同）
    const shuffledItems = shuffle(items.slice())
    for (let i = 0; i < DRIFT_COLUMN_COUNT; i++) {
      const col = document.createElement('div')
      col.className = 'drift-wall__col'
      col.style.setProperty('--c-depth', depths[i] + 'px')
      const track = document.createElement('div')
      track.className = 'drift-wall__track'
      // 每列分配 4 tile：从 shuffledItems 环形取 4 张（步长 4 保证 9 列不同片段）
      const startIdx = (i * 4) % shuffledItems.length
      const colItems = []
      for (let k = 0; k < 4; k++) colItems.push(shuffledItems[(startIdx + k) % shuffledItems.length])
      shuffle(colItems)
      colItems.forEach((src) => {
        const tile = document.createElement('a')
        tile.className = 'drift-wall__tile'
        tile.href = '#'
        const inner = document.createElement('span')
        inner.className = 'drift-wall__inner'
        const img = document.createElement('img')
        img.src = src
        img.alt = ''
        img.loading = 'lazy'
        const overlay = document.createElement('span')
        overlay.className = 'drift-wall__overlay'
        inner.appendChild(img)
        inner.appendChild(overlay)
        tile.appendChild(inner)
        // hover 绑定（pointerenter/leave 不冒泡 → 不闪烁）
        tile.addEventListener('pointerenter', () => tile.classList.add('is-active'))
        tile.addEventListener('pointerleave', () => tile.classList.remove('is-active'))
        track.appendChild(tile)
      })
      col.appendChild(track)
      plane.appendChild(col)
      cols.push(track)
    }
    wall.appendChild(plane)

    const speed = 36
    const parallax = 0.1
    const tilt = 8               // 倾斜减小（让 3D 投影下间距更接近实际）
    const turn = -6
    let currRx = tilt, currRy = turn, currPx = 0, currPy = 0
    let targetRx = tilt, targetRy = turn, targetPx = 0, targetPy = 0

    // 每列克隆 5 份【相同顺序】→ 6 份序列无缝循环
    const colState = cols.map((track) => {
      const items2 = Array.from(track.children)
      shuffle(items2)
      for (let k = 0; k < 5; k++) {
        items2.forEach((c) => {
          const clone = c.cloneNode(true)
          clone.addEventListener('pointerenter', () => clone.classList.add('is-active'))
          clone.addEventListener('pointerleave', () => clone.classList.remove('is-active'))
          track.appendChild(clone)
        })
      }
      const h = track.scrollHeight
      return { track, h, y: -Math.random() * (h / 2), speedMul: 0.7 + Math.random() * 0.6 }
    })

    wall.addEventListener('pointermove', (e) => {
      const r = wall.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width / 2) / r.width
      const dy = (e.clientY - r.top - r.height / 2) / r.height
      targetRx = tilt + dy * 1.5 * parallax
      targetRy = turn + dx * 2 * parallax
      targetPx = (e.clientX - r.left - r.width / 2) * parallax
      targetPy = (e.clientY - r.top - r.height / 2) * parallax
    })
    wall.addEventListener('pointerleave', () => {
      targetRx = tilt
      targetRy = turn
      targetPx = 0
      targetPy = 0
      wall.querySelectorAll('.drift-wall__tile.is-active').forEach((t) => t.classList.remove('is-active'))
    })
    // 点击 tile → 查看大图（事件委托，克隆的 tile 也生效）
    wall.addEventListener('click', (e) => {
      const tile = e.target.closest('.drift-wall__tile')
      if (!tile) return
      e.preventDefault()
      const img = tile.querySelector('img')
      if (img && window.openLightbox) window.openLightbox(img.src)
    })

    let last = performance.now()
    let rafId = 0
    function loop() {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      currRx += (targetRx - currRx) * 0.08
      currRy += (targetRy - currRy) * 0.08
      currPx += (targetPx - currPx) * 0.08
      currPy += (targetPy - currPy) * 0.08
      plane.style.transform =
        `translate(-50%, -50%) ` +
        `translateX(${currPx}px) translateY(${currPy}px) ` +
        `rotateX(${currRx}deg) rotateY(${currRy}deg)`
      colState.forEach((c) => {
        c.y -= speed * c.speedMul * dt
        if (c.y < -c.h / 2) c.y += c.h / 2
        c.track.style.transform = `translateY(${c.y}px)`
      })
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    // 返回取消函数：关闭弹窗时停止 RAF，避免多次开合叠加多个 loop 卡死页面
    return () => cancelAnimationFrame(rafId)
  }

  /* ============================================================
     GSAP + ScrollTrigger 动效
     ============================================================ */
  if (hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger)

    /* ============================================================
       Section 1 · Hero Pin（核心接管动画）
       ============================================================ */
    const heroEl = document.getElementById('hero')
    if (heroEl) {
      // 强制设置初始态
      gsap.set('[data-ip-a]', { opacity: 1 })
      gsap.set('[data-ip-b]', { opacity: 0 })
      gsap.set('[data-takeover]', { scale: 0 })

      const heroTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      // 文字流：滚到 0.5 时停止（xPercent 0 → -25%），让"GO"前的位置在视口右侧
      heroTl.to('[data-stream]', { xPercent: -25 }, 0)
      // 0.5 之后文字流锁在 -25% 不再移动
      heroTl.set('[data-stream]', { xPercent: -25 }, 0.5)

      // IP 微微右移（让出位置给文字流穿过）
      heroTl.to('[data-ip]', { xPercent: 6 }, 0)

      // IP 姿态切换：干脆但自然 —— 先快速"收拢"（缩小+微倾），翻面换图，再"展开"归位
      heroTl.to('[data-ip]', { scale: 0.55, rotation: -16, duration: 0.035, ease: 'power2.in' }, 0.28)
      // 翻面瞬间换图（无叠化）
      heroTl.set('[data-ip-a]', { opacity: 0 }, 0.315)
      heroTl.set('[data-ip-b]', { opacity: 1 }, 0.315)
      // 展开归位
      heroTl.to('[data-ip]', { scale: 1, rotation: 0, duration: 0.04, ease: 'power3.out' }, 0.315)

      // 接管黑圆点：0.5~0.6 scale 0→40 在右侧（left 75%）放大盖满全屏
      // 0.6 之后保持不动（黑圆即"正常页面"），hero-pin 滚完后自然衔接 BIGGER 黑屏
      heroTl.fromTo(
        '[data-takeover]',
        { scale: 0 },
        { scale: 40, duration: 0.1, ease: 'power2.in' },
        0.5,
      )
      // 文字流在接管时淡出
      heroTl.to('[data-stream]', { opacity: 0, duration: 0.05 }, 0.5)
      // 底部 hero 跑马灯也淡出（避免圆点接管后还显示 WE ARE A DESIGNER...）
      heroTl.to('[data-marquee-fade]', { opacity: 0, duration: 0.05 }, 0.5)
      // IP 进入黑圆后隐藏（0.5 起快速淡出，不留 IP 在圆内）
      heroTl.to('[data-ip]', { opacity: 0, duration: 0.03, ease: 'power1.in' }, 0.5)
    }

  /* ============================================================
     Section 2/3/4 · Stage（BIGGER / BOLDER / BETTER 纯黑屏）
     ============================================================ */
    // 注：背景 IP 旋转已按用户要求移除，stage 保持纯黑 + 巨型字

    /* ============================================================
       reveal-text 行 mask 滑入
       ============================================================ */
    document.querySelectorAll('.reveal-text').forEach((el) => {
      const lines = el.querySelectorAll('.line')
      gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'restart none none reset' },
      }).to(lines, { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.14 }, 0.1)
    })

    /* -- About 屏文段淡入 -- */
    gsap.from('.about-page-text, .about-page-dont, .button-interactive', {
      y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.about-page-body', start: 'top 78%', once: true },
    })

    /* -- Works 卡片 -- */
    gsap.from('.work-card', {
      y: 60, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.works-grid', start: 'top 80%', once: true },
    })

    /* -- Skills 行 -- */
    gsap.from('.service-item', {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.skills-list', start: 'top 85%', once: true },
    })

    /* -- Footer 黑→黄展开 -- */
    const footerEl = document.getElementById('footer')
    const updateFooter = () => {
      if (!footerEl) return
      const r = footerEl.getBoundingClientRect()
      footerEl.classList.toggle('is-active', r.top < window.innerHeight * 0.6)
    }
    window.addEventListener('scroll', updateFooter, { passive: true })
    updateFooter()

    window.addEventListener('load', () => ScrollTrigger.refresh())
  }
})()
