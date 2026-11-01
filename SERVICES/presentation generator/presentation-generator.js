const presentationGeneratorWrap = document.querySelector('.presentation-generator-wrap');
// Open
let presentationGenerationLib = false,
  textHeightCalculatorLib = null;
const openPresentationGeneratorBtn = allDashboardItem.querySelector('button.open-presentation-generator-wrap');
openPresentationGeneratorBtn.addEventListener('click', async () => {
  closeAllWraps();
  presentationGeneratorWrap.classList.add('show');

  if(!presentationGenerationLib || !textHeightCalculatorLib) {
    showPreloader();
    whatIsLoadingText.textContent = 'Loading presentation generator...';
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;

    await loadScript('https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs/dist/pptxgen.bundle.js');
    textHeightCalculatorLib = await import(
      'https://cdn.jsdelivr.net/npm/@neo-ma/pptxgenjs-std@0.4.0/dist/index.mjs'
    ).then(r => r.measureText);

    presentationGenerationLib = true;

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  history.pushState(null, null, '#presentationGenerator')
})

const PRESENTATION_GENERATOR_URL = 'https://presentation-generator.dark-backend.workers.dev';

const presentationGeneratorLoader = presentationGeneratorWrap.querySelector('span.loader');

// Topic & context & slides number & result elements
const presentationGeneratorTopicInput = presentationGeneratorWrap.querySelector('input.topic');
const presentationGeneratorContextTextarea = presentationGeneratorWrap.querySelector('textarea');
const presentationGeneratorSlidesNumberInput = presentationGeneratorWrap.querySelector('input.slides-number');

const presentationGeneratorStylesSelectCont = presentationGeneratorWrap.querySelector('div.styles-select');
presentationGeneratorStylesSelectCont.addEventListener('click', e => {
  const target = e.target;

  if(target.tagName === 'BUTTON' && target.classList.contains('download-btn')) {
    const style = target.dataset.style;
    if(style && presentationGeneratorSlidesData) presentationGeneratorDownloadStyles(style);
  }
})

// --- Send
const presentationGeneratorSendBtn = presentationGeneratorWrap.querySelector('button.send');
presentationGeneratorSendBtn.addEventListener('click', async () => {
  const topic = presentationGeneratorTopicInput.value.trim();
  const context = presentationGeneratorContextTextarea.value.trim();
  const slidesNumber = +presentationGeneratorSlidesNumberInput.value;

  if(!topic) {
    presentationGeneratorTopicInput.focus();
    return showResponseFn('Please enter a topic!');
  } else if(topic.length > 50) {
    presentationGeneratorTopicInput.focus();
    return showResponseFn('Your topic is too long (>50)');
  } else if(context.length > 500) {
    presentationGeneratorContextTextarea.focus();
    return showResponseFn('Your context is too long (>500)');
  } else if(slidesNumber < 2 || slidesNumber > 15) {
    presentationGeneratorSlidesNumberInput.value = slidesNumber < 2 ? '2' : '15';
    presentationGeneratorSlidesNumberInput.focus();
    return showResponseFn('Number of slides must be > 1 and < 16');
  }

  presentationGeneratorSendBtn.disabled = true;
  presentationGeneratorLoader.style.display = 'block';
  presentationGeneratorStylesSelectCont.textContent = '';

  try {
    const slidesData = await fetch(PRESENTATION_GENERATOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, slides: slidesNumber, context })
    }).then(r => r.json());

    if(!Array.isArray(slidesData) && slidesData.error) {
      showResponseFn(`Error: ${slidesData.error}`);
      return presentationGeneratorStylesSelectCont.innerHTML = `<h3 style="color: red; user-select: all;">Error: ${slidesData.error}</h3>`;
    }

    presentationGeneratorTopicInput.value = '';
    presentationGeneratorContextTextarea.value = '';

    showPresentationStylesSelect(slidesData);
  } catch (e) {
    showResponseFn(`Error: ${e.message}`);
    console.error(e);
  } finally {
    presentationGeneratorSendBtn.disabled = false;
    presentationGeneratorLoader.style.display = 'none';
  }
})

const renderPresentationDescription = (text, type) => {
  const parts = [...text.matchAll(/(\*{1,3})(.+?)\1|~~(.+?)~~|(\n)|([^\*~\n]+)/g)]
    .map(match => {
      if (match[1]) {
        return {
          text: match[2],
          options: {
            bold: match[1].length >= 2,
            italic: match[1].length === 1 || match[1].length === 3
          }
        };
      }

      if (match[3]) {
        return {
          text: match[3],
          options: { strike: true }
        };
      }

      if (match[4]) {
        return {
          text: '\n',
          options: {}
        };
      }

      return {
        text: match[5],
        options: {}
      };
    });

  if (type === 'preview') {
    return parts.map(({ text, options }) => {
      if (text === '\n') return '<br>';

      let result = text;

      if (options.italic) result = `<em>${result}</em>`;
      if (options.bold) result = `<strong>${result}</strong>`;
      if (options.strike) result = `<del>${result}</del>`;

      return result;
    }).join('');
  }

  if (type === 'slide') {
    return parts.map(({ text, options }) => ({
      text,
      options
    }));
  }
};

let presentationGeneratorSlidesData = null;
function showPresentationStylesSelect(data) {
  presentationGeneratorSlidesData = data;
  const firstSlide = data[0];

  presentationGeneratorStylesSelectCont.innerHTML = createHTMLForSlide(firstSlide);
}

function createHTMLForSlide(slideData) {
  const image = slideData.image_url;

  return `
    <div class="styles-list">
      <!-- Default -->
      <div class="style">
        <div class="preview default ${image ? 'image-bgc' : ''}" style="${image
      ? `background-image: url('${image}'); background-size: cover; background-position: center;`
      : ''
    }">

          <h3>${hashHtmlSymbols(slideData.title)}</h3>
          <p class='description'>${renderPresentationDescription(hashHtmlSymbols(slideData.description), 'preview')}</p>

          ${slideData.notes?.length ? `<div class="notes">${slideData.notes.map(obj => `<div class='note'><h4>${obj.key}</h4><p>${obj.value}</p></div>`).join('')}</div>` : ''}
        </div>

        <div class="style-option">
          <span>Default</span>
          <button data-style="default" type="button" class="download-btn">DOWNLOAD</button>
        </div>
      </div>

      <!-- Minimal corners -->
      <div class="style">
        <div class="preview minimal-corners ${image ? 'image-bgc' : ''}" style="${image
      ? `background-image: url('${image}'); background-size: cover; background-position: center;`
      : ''
    }">

          <h3>${hashHtmlSymbols(slideData.title)}</h3>
          <p class='description'>${renderPresentationDescription(hashHtmlSymbols(slideData.description), 'preview')}</p>

          ${slideData.notes?.length ? `<div class="notes">${slideData.notes.map(obj => `<div class='note'><h4>${obj.key}</h4><p>${obj.value}</p></div>`).join('')}</div>` : ''}
        </div>

        <div class="style-option">
          <span>Minimal Corners</span>
          <button data-style="minimal-corners" type="button" class="download-btn">DOWNLOAD</button>
        </div>
      </div>

      <!-- Ghost titles -->
      <div class="style">
        <div class="preview ghost-titles ${image ? 'image-bgc' : ''}" style="${image
      ? `background-image: url('${image}'); background-size: cover; background-position: center;`
      : ''
    }">

          <h3>${hashHtmlSymbols(slideData.title)}</h3>
          <p class='description'>${renderPresentationDescription(hashHtmlSymbols(slideData.description), 'preview')}</p>

          ${slideData.notes?.length ? `<div class="notes">${slideData.notes.map(obj => `<div class='note'><h4>${obj.key}</h4><p>${obj.value}</p></div>`).join('')}</div>` : ''}

          <h3 class="ghost">${hashHtmlSymbols(slideData.title)}</h3>
        </div>

        <div class="style-option">
          <span>Ghost Titles</span>
          <button data-style="ghost-titles" type="button" class="download-btn">DOWNLOAD</button>
        </div>
      </div>

      <!-- Gradient divider -->
      <div class="style">
        <div class="preview gradient-divider ${image ? 'image-bgc' : ''}" style="${image
      ? `background-image: url('${image}'); background-size: 100% 75%; background-position: center 100%;`
      : ''
    }">

          <h3>${hashHtmlSymbols(slideData.title)}</h3>
          <div class="split"></div>
          <p class='description'>${renderPresentationDescription(hashHtmlSymbols(slideData.description), 'preview')}</p>

          ${slideData.notes?.length ? `<div class="notes">${slideData.notes.map(obj => `<div class='note'><h4>${obj.key}</h4><p>${obj.value}</p></div>`).join('')}</div>` : ''}
        </div>

        <div class="style-option">
          <span>Gradient Divider</span>
          <button data-style="gradient-divider" type="button" class="download-btn">DOWNLOAD</button>
        </div>
      </div>

      <!-- Vertical title -->
      <div class="style">
        <div class="preview vertical-title ${image ? 'image-bgc' : ''}" style="${image
      ? `background-image: url('${image}'); background-size: 65% 100%; background-position: right center;`
      : ''
    }">

          <h3>${hashHtmlSymbols(slideData.title)}</h3>
          <p class='description'>${renderPresentationDescription(hashHtmlSymbols(slideData.description), 'preview')}</p>

          ${slideData.notes?.length ? `<div class="notes">${slideData.notes.map(obj => `<div class='note'><h4>${obj.key}</h4><p>${obj.value}</p></div>`).join('')}</div>` : ''}
        </div>

        <div class="style-option">
          <span>Vertical Title</span>
          <button data-style="vertical-title" type="button" class="download-btn">DOWNLOAD</button>
        </div>
      </div>
    </div>
  `;
}

async function presentationGeneratorDownloadStyles(style) {
  const data = presentationGeneratorSlidesData;
  if(!style || !data) return;

  const downloadButton = presentationGeneratorStylesSelectCont.querySelector('button.download-btn');

  presentationGeneratorLoader.style.display = 'block';
  if (downloadButton) downloadButton.disabled = true;

  try {
    const pptx = new PptxGenJS();

    pptx.layout = 'LAYOUT_WIDE';

    pptx.theme = {
      headFontFace: 'Arial',
      bodyFontFace: 'Arial',
    };

    const calculateTextHeightFn = (text, data) => {
      const { h } = textHeightCalculatorLib(text, data);

      return h;
    }

    // Notes position/height
    const notesY = 6;
    const notesH = 1.3;

    const addNotes = (slide, notes, {
      x, y, w, h,
      color = 'f4f4f4',
      borderColor = '000000',
      keyFontSize = 14,
      valueFontSize = 11,
      fill
    } = {}) => {
      if (!notes?.length) return;

      const gap = 0.16;
      const count = notes.length;
      const noteW = (w - gap * (count - 1)) / count;

      // Background
      if (fill) {
        slide.addShape(pptx.ShapeType.rect, {
          x, y, w, h,
          fill,
          margin: 4.5,
          line: { color: borderColor, }
        });
      }

      notes.forEach(({ key, value }, index) => {
        const noteX = x + index * (noteW + gap);

        if (index > 0) {
          slide.addShape(pptx.ShapeType.line, {
            x: noteX - gap / 2,
            y: y + 0.05,
            w: 0,
            h: h - 0.1,
            margin: 4.5,
            line: {
              color: borderColor,
              width: 1
            }
          });
        }

        const paddingX = 0.2;
        const paddingY = 0.15;

        // Key
        slide.addText(key, {
          x: noteX + paddingX,
          y: y + paddingY,
          w: noteW - paddingX * 2,
          h: h * 0.45 - paddingY,
          fontFace: 'Arial',
          fontSize: keyFontSize,
          bold: true,
          italic: true,
          color,
          valign: 'top',
          align: 'left',
          fit: 'shrink'
        });

        // Value
        slide.addText(value, {
          x: noteX + paddingX,
          y: y + h * 0.48,
          w: noteW - paddingX * 2,
          h: h * 0.48 - paddingY,
          fontFace: 'Arial',
          fontSize: valueFontSize,
          color,
          italic: true,
          valign: 'top',
          align: 'left',
          fit: 'shrink'
        });
      });
    };

    for (const slideData of data) {
      const slide = pptx.addSlide();

      const title = slideData.title;
      const description = slideData.description;

      const titleSize = Math.max(
        20,
        Math.min(44, 44 * 20 / Math.max(title.length, 1))
      );

      const descriptionSize = 16;

      const slideBg = 'F3F6FA';
      const titleColor = '172554';
      const descriptionColor = '334155';

      // Notes constants
      const notes = Array.isArray(slideData.notes)
        ? slideData.notes.slice(0, 3)
        : [];

      const hasNotes = notes?.length > 0;

      // === Image ===
      const imageUrl = slideData.image_url;

      // DEFAULT
      if (style === 'default') {
        // Image
        if (imageUrl) slide.addImage({
          path: imageUrl,
          x: 0,
          y: 0,
          w: 13.333,
          h: 7.5,
        });

        slide.background = { color: slideBg };

        const parameters = {
          title: {
            x: 1,
            y: 0.7,
            w: 11.4,
            fontFace: 'Arial',
            fontSize: titleSize,
            bold: true,
            color: titleColor,
            valign: 'mid',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: 'ffffff',
              transparency: 30
            } : undefined
          }, description: {
            x: 1,
            y: 1.7,
            w: 11.4,
            fontFace: 'Arial',
            fontSize: descriptionSize,
            color: descriptionColor,
            valign: 'top',
            breakLine: false,
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: 'ffffff',
              transparency: 30
            } : undefined
          }
        }

        // Title
        slide.addText(title, { ...parameters.title, h: calculateTextHeightFn(title, parameters.title) });

        // Description
        slide.addText(renderPresentationDescription(description, 'slide'), { ...parameters.description, h: calculateTextHeightFn(description, parameters.description) + 0.4 });

        // Notes
        if (hasNotes) addNotes(slide, notes, {
          x: 1,
          y: notesY,
          w: 11.4,
          h: notesH,
          color: '334155',
          borderColor: 'ffffff',
          margin: 1.5,
          fill: imageUrl ? {
            color: 'ffffff',
            transparency: 30
          } : undefined
        });
      }

      // MINIMAL CORNERS
      else if (style === 'minimal-corners') {
        // Image
        if (imageUrl) slide.addImage({
          path: imageUrl,
          x: 0,
          y: 0,
          w: 13.333,
          h: 7.5,
        });

        slide.background = { color: '262323' };

        // Circle
        slide.addShape(pptx.ShapeType.ellipse, {
          x: -0.4,
          y: 6,
          w: 2.2,
          h: 2.2,
          line: { color: 'C7D2FE', transparency: 100 },
          fill: { color: 'C7D2FE' },
        });

        // Circle 2
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 12.3,
          y: 6.5,
          w: 1.6,
          h: 1.6,
          line: { color: '818CF8', transparency: 100 },
          fill: { color: '818CF8', transparency: 40 },
        });

        const parameters = {
          title: {
            x: 0.5,
            y: 0.3,
            w: 12.2,
            fontFace: 'Arial',
            fontSize: Math.min(titleSize, 30),
            bold: true,
            color: 'f4f4f4',
            valign: 'mid',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: '000000',
              transparency: 30
            } : undefined
          }, description: {
            x: 1.1,
            y: 1.9,
            w: 11.1,
            fontFace: 'Arial',
            fontSize: descriptionSize,
            color: 'd9e9ff',
            valign: 'mid',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: '000000',
              transparency: 30
            } : undefined
          }
        }

        // Title
        slide.addText(title, { ...parameters.title, h: calculateTextHeightFn(title, parameters.title) });

        // Description
        slide.addText(renderPresentationDescription(description, 'slide'), { ...parameters.description, h: calculateTextHeightFn(description, parameters.description) + 0.4 });

        // Notes
        if (hasNotes) addNotes(slide, notes, {
          x: 1.1,
          y: 5.4,
          w: 11.1,
          h: 1.2,
          color: 'd9e9ff',
          borderColor: '000000',
          margin: 1.5,
          fill: imageUrl ? {
            color: '000000',
            transparency: 30
          } : undefined
        });
      }

      // GHOST TITLES
      else if (style === 'ghost-titles') {
        slide.background = { color: '111827' };

        const ghostFontSize = Math.min(titleSize * 0.78, 30);
        const ghostHeight = ghostFontSize / 72 * 1.3;
        const bottomMargin = 0.05;

        // Image
        if (imageUrl) slide.addImage({
          path: imageUrl,
          x: 0,
          y: 0,
          w: 13.333,
          h: 7.5,
        });

        const parameters = {
          title: {
            x: 0.9,
            y: 0.5,
            w: 11.5,
            fontFace: 'Arial',
            fontSize: Math.min(titleSize, 40),
            bold: true,
            color: 'F8FAFC',
            valign: 'mid',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: '000000',
              transparency: 30
            } : undefined
          }, description: {
            x: 1.05,
            y: 1.9,
            w: 11.2,
            fontFace: 'Arial',
            fontSize: descriptionSize,
            color: 'E2E8F0',
            valign: 'mid',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: '000000',
              transparency: 30
            } : undefined
          }
        }

        // Title
        slide.addText(title, { ...parameters.title, h: calculateTextHeightFn(title, parameters.title) });

        // Description
        slide.addText(renderPresentationDescription(description, 'slide'), { ...parameters.description, h: calculateTextHeightFn(description, parameters.description) + 0.4 });

        // Notes
        if (hasNotes) addNotes(slide, notes, {
          x: 1.05,
          y: 5.3,
          w: 11.2,
          h: 1.1,
          color: 'E2E8F0',
          borderColor: '000000',
          keyFontSize: 13,
          valueFontSize: 10,
          margin: 1.5,
          fill: imageUrl ? {
            color: '000000',
            transparency: 30
          } : undefined
        });

        // Ghost title
        slide.addText(title, {
          x: 0.7,
          y: 7.5 - ghostHeight - bottomMargin,
          w: 11.9,
          h: ghostHeight,
          fontFace: 'Arial',
          fontSize: ghostFontSize,
          bold: true, color: 'FFFFFF',
          transparency: 60,
          valign: 'mid',
          fit: 'shrink',
          margin: 1.5,
          fill: imageUrl ? {
            color: '000000',
            transparency: 30
          } : undefined
        });
      }

      // GRADIENT DIVIDER
      else if (style === 'gradient-divider') {
        slide.background = { color: '312E81' };

        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.333,
          h: 2,
          line: { color: '111827', transparency: 100 },
          fill: { color: '111827' },
        });

        const dividerColors = [
          '6366F1',
          '818CF8',
          'A78BFA',
          '818CF8',
          '6366F1',
        ];

        const segmentWidth = 13.333 / dividerColors.length;

        dividerColors.forEach((color, index) => {
          slide.addShape(pptx.ShapeType.rect, {
            x: index * segmentWidth,
            y: 2,
            w: segmentWidth + 0.01,
            h: 0.25,
            line: { color, transparency: 100 },
            fill: { color },
          });
        });

        const parameters = {
          title: {
            x: 1,
            y: 0.5,
            w: 11.4,
            fontFace: 'Arial',
            fontSize: Math.min(titleSize, 40),
            bold: true,
            color: 'F8FAFC',
            valign: 'mid',
            fit: 'shrink',
          }, description: {
            x: 1,
            y: 2.25,
            w: 11.4,
            fontFace: 'Arial',
            fontSize: descriptionSize,
            color: 'F1F5F9',
            valign: 'top',
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: '000000',
              transparency: 30
            } : undefined
          }
        }

        // Image
        if (imageUrl) slide.addImage({
          path: imageUrl,
          x: 0,
          y: 2.25,
          w: 13.333,
          h: 7.5 - 2
        });

        // Title
        slide.addText(title, { ...parameters.title, h: calculateTextHeightFn(title, parameters.title) });

        // Description
        slide.addText(renderPresentationDescription(description, 'slide'), { ...parameters.description, h: calculateTextHeightFn(description, parameters.description) + 0.4 });

        if (hasNotes) addNotes(slide, notes, {
          x: 1,
          y: 5.4,
          w: 11.4,
          h: 1.2,
          color: 'F1F5F9',
          borderColor: '000000',
          keyFontSize: 14,
          valueFontSize: 11,
          margin: 1.5,
          fill: imageUrl ? {
            color: '000000',
            transparency: 30
          } : undefined
        });
      }

      // VERTICAL TITLE
      else if (style === 'vertical-title') {
        slide.background = { color: 'FFFFFF' };

        // Image
        if (imageUrl) slide.addImage({
          path: imageUrl,
          x: 4.5,
          y: 0,
          w: 13.333 - 4.5,
          h: 7.5,
        });

        // Blue sidebar for title
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 4.5,
          h: 7.5,
          line: { color: '172554', transparency: 100 },
          fill: { color: '172554' },
        });

        const parameters = {
          description: {
            x: 5,
            y: 0.8,
            w: 7.5,
            fontFace: 'Arial',
            fontSize: descriptionSize,
            color: '15263e',
            align: 'center',
            valign: 'mid',
            margin: 0.1,
            breakLine: false,
            fit: 'shrink',
            margin: 1.5,
            fill: imageUrl ? {
              color: 'ffffff',
              transparency: 30
            } : undefined
          }
        }

        // Title
        slide.addText(title, {
          x: 0.5,
          y: 0.5,
          w: 3.5,
          h: 6.5,
          fontFace: 'Arial',
          fontSize: Math.min(titleSize, 34),
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          valign: 'mid',
          vert: 'vert270',
          fit: 'shrink',
        });

        // Description
        slide.addText(renderPresentationDescription(description, 'slide'), { ...parameters.description, h: calculateTextHeightFn(description, parameters.description) + 0.4 });

        if (hasNotes) addNotes(slide, notes, {
          x: 5,
          y: 5.2,
          w: 7.5,
          h: 1.3,
          color: '15263e',
          borderColor: 'ffffff',
          margin: 1.5,
          fill: imageUrl ? {
            color: 'ffffff',
            transparency: 30
          } : undefined
        });
      }
    }

    await pptx.writeFile({ fileName: `presentation-${data[0].title}__${crypto.randomUUID()}` });
  } catch (error) {
    console.error('Error: ', error);
    showResponseFn(`Error: ${e.messages}`);
  } finally {
    presentationGeneratorLoader.style.display = 'none';
    if (downloadButton) downloadButton.disabled = false;
  }
}