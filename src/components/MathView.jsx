import React, { useState, useEffect } from 'react';

const MATHML_MAP = {
  box_blur: (
    <math display="inline">
      <mi>h</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <mfrac>
        <mn>1</mn>
        <mrow><mi>M</mi><mo>&times;</mo><mi>N</mi></mrow>
      </mfrac>
      <munder><mo>&sum;</mo><mrow><mi>s</mi><mo>,</mo><mi>t</mi></mrow></munder>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>+</mo><mi>s</mi><mo>,</mo><mi>y</mi><mo>+</mo><mi>t</mi><mo stretchy="false">)</mo>
    </math>
  ),
  gaussian_blur: (
    <math display="inline">
      <mi>G</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <mfrac>
        <mn>1</mn>
        <mrow><mn>2</mn><mi>&pi;</mi><msup><mi>&sigma;</mi><mn>2</mn></msup></mrow>
      </mfrac>
      <msup>
        <mi>e</mi>
        <mrow>
          <mo>&minus;</mo>
          <mfrac>
            <mrow><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><msup><mi>y</mi><mn>2</mn></msup></mrow>
            <mrow><mn>2</mn><msup><mi>&sigma;</mi><mn>2</mn></msup></mrow>
          </mfrac>
        </mrow>
      </msup>
    </math>
  ),
  weighted_average: (
    <math display="inline">
      <mi>W</mi>
      <mo>=</mo>
      <mfrac><mn>1</mn><mn>16</mn></mfrac>
      <mfenced open="[" close="]">
        <mtable>
          <mtr><mtd><mn>1</mn></mtd><mtd><mn>2</mn></mtd><mtd><mn>1</mn></mtd></mtr>
          <mtr><mtd><mn>2</mn></mtd><mtd><mn>4</mn></mtd><mtd><mn>2</mn></mtd></mtr>
          <mtr><mtd><mn>1</mn></mtd><mtd><mn>2</mn></mtd><mtd><mn>1</mn></mtd></mtr>
        </mtable>
      </mfenced>
    </math>
  ),
  median_filter: (
    <math display="inline">
      <mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <mtext>median</mtext>
      <mo stretchy="false">{"{"}</mo>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>+</mo><mi>s</mi><mo>,</mo><mi>y</mi><mo>+</mo><mi>t</mi><mo stretchy="false">)</mo>
      <mo>&mid;</mo>
      <mo stretchy="false">(</mo><mi>s</mi><mo>,</mo><mi>t</mi><mo stretchy="false">)</mo><mo>&isin;</mo><mi>S</mi>
      <mo stretchy="false">{"}"}</mo>
    </math>
  ),
  laplacian_4: (
    <math display="inline">
      <msup><mo>&nabla;</mo><mn>2</mn></msup><mi>f</mi>
      <mo>=</mo>
      <mfrac>
        <mrow><msup><mo>&part;</mo><mn>2</mn></msup><mi>f</mi></mrow>
        <mrow><mo>&part;</mo><msup><mi>x</mi><mn>2</mn></msup></mrow>
      </mfrac>
      <mo>+</mo>
      <mfrac>
        <mrow><msup><mo>&part;</mo><mn>2</mn></msup><mi>f</mi></mrow>
        <mrow><mo>&part;</mo><msup><mi>y</mi><mn>2</mn></msup></mrow>
      </mfrac>
    </math>
  ),
  laplacian_8: (
    <math display="inline">
      <msubsup><mo>&nabla;</mo><mn>8</mn><mn>2</mn></msubsup><mi>f</mi>
      <mo>=</mo>
      <munder><mo>&sum;</mo><mrow><mn>8</mn><mtext>-neighbors</mtext></mrow></munder>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>+</mo><mi>s</mi><mo>,</mo><mi>y</mi><mo>+</mo><mi>t</mi><mo stretchy="false">)</mo>
      <mo>&minus;</mo>
      <mn>8</mn><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
    </math>
  ),
  laplacian_sharpen: (
    <math display="inline">
      <mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>&minus;</mo>
      <msup><mo>&nabla;</mo><mn>2</mn></msup><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
    </math>
  ),
  sobel_gradient: (
    <math display="inline">
      <mi>M</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <msqrt>
        <mrow><msubsup><mi>G</mi><mi>x</mi><mn>2</mn></msubsup><mo>+</mo><msubsup><mi>G</mi><mi>y</mi><mn>2</mn></msubsup></mrow>
      </msqrt>
      <mo>,</mo>
      <mspace width="0.6em"/>
      <mi>&theta;</mi><mo>=</mo><mi>arctan</mi><mo stretchy="false">(</mo><msub><mi>G</mi><mi>y</mi></msub><mo>/</mo><msub><mi>G</mi><mi>x</mi></msub><mo stretchy="false">)</mo>
    </math>
  ),
  prewitt_gradient: (
    <math display="inline">
      <mo stretchy="false">|</mo><mi>G</mi><mo stretchy="false">|</mo>
      <mo>=</mo>
      <msqrt>
        <mrow><msubsup><mi>G</mi><mi>x</mi><mn>2</mn></msubsup><mo>+</mo><msubsup><mi>G</mi><mi>y</mi><mn>2</mn></msubsup></mrow>
      </msqrt>
    </math>
  ),
  high_boost: (
    <math display="inline">
      <msub><mi>f</mi><mtext>hb</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>=</mo>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo>+</mo>
      <mi>k</mi><mo>&sdot;</mo>
      <mo stretchy="false">[</mo>
      <mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>&minus;</mo><mover><mi>f</mi><mo>&macr;</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo stretchy="false">)</mo>
      <mo stretchy="false">]</mo>
    </math>
  ),
  canny_edge: (
    <math display="inline">
      <mtext>Canny</mtext>
      <mo>=</mo>
      <mtext>Hysteresis</mtext>
      <mo stretchy="false">(</mo>
      <mtext>NMS</mtext>
      <mo stretchy="false">(</mo>
      <mo>&#8741;</mo><mo>&nabla;</mo><mo stretchy="false">(</mo><msub><mi>G</mi><mi>&sigma;</mi></msub><mo>&lowast;</mo><mi>I</mi><mo stretchy="false">)</mo><mo>&#8741;</mo>
      <mo stretchy="false">)</mo>
      <mo>,</mo>
      <mspace width="0.4em"/>
      <msub><mi>T</mi><mtext>low</mtext></msub>
      <mo>,</mo>
      <mspace width="0.4em"/>
      <msub><mi>T</mi><mtext>high</mtext></msub>
      <mo stretchy="false">)</mo>
    </math>
  ),
  harris_corner: (
    <math display="inline">
      <mi>R</mi>
      <mo>=</mo>
      <mi>det</mi><mo stretchy="false">(</mo><mi>M</mi><mo stretchy="false">)</mo>
      <mo>&minus;</mo>
      <mi>k</mi>
      <mo>&sdot;</mo>
      <msup>
        <mrow><mo stretchy="false">(</mo><mi>trace</mi><mo stretchy="false">(</mo><mi>M</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow>
        <mn>2</mn>
      </msup>
      <mo>,</mo>
      <mspace width="0.6em"/>
      <mi>M</mi>
      <mo>=</mo>
      <mfenced open="[" close="]">
        <mtable>
          <mtr><mtd><mo>&lang;</mo><msubsup><mi>I</mi><mi>x</mi><mn>2</mn></msubsup><mo>&rang;</mo></mtd><mtd><mo>&lang;</mo><msub><mi>I</mi><mi>x</mi></msub><msub><mi>I</mi><mi>y</mi></msub><mo>&rang;</mo></mtd></mtr>
          <mtr><mtd><mo>&lang;</mo><msub><mi>I</mi><mi>x</mi></msub><msub><mi>I</mi><mi>y</mi></msub><mo>&rang;</mo></mtd><mtd><mo>&lang;</mo><msubsup><mi>I</mi><mi>y</mi><mn>2</mn></msubsup><mo>&rang;</mo></mtd></mtr>
        </mtable>
      </mfenced>
    </math>
  )
};

export function MathView({ latex = '', filterId = '', className = '', displayMode = false }) {
  const [katexLoaded, setKatexLoaded] = useState(typeof window !== 'undefined' && !!window.katex);

  useEffect(() => {
    if (typeof window === 'undefined' || window.katex) return;

    const interval = setInterval(() => {
      if (window.katex) {
        setKatexLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (katexLoaded && window.katex && latex) {
    try {
      const renderedHtml = window.katex.renderToString(latex, {
        throwOnError: false,
        displayMode: displayMode
      });
      return (
        <span 
          className={`math-rendered-katex ${className}`}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    } catch {
      // fallback to MathML below
    }
  }

  // Native MathML Core Fallback
  if (filterId && MATHML_MAP[filterId]) {
    return (
      <span className={`math-rendered-mathml ${className}`}>
        {MATHML_MAP[filterId]}
      </span>
    );
  }

  // Clean fallback if neither
  return (
    <span className={`math-rendered-fallback ${className}`}>
      {latex}
    </span>
  );
}

export default MathView;

