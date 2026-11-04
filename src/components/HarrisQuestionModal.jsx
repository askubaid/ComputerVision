import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle, 
  Waves, 
  Cpu, 
  Zap, 
  Target, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { MathView } from './MathView';

export const HARRIS_QUESTIONS = [
  {
    id: 'q1',
    task: 'Task 1: Image Gradients',
    icon: Waves,
    title: 'Meaning of Horizontal (Ix) and Vertical (Iy) Gradients',
    question: 'What is the meaning of Ix and Iy, and how do they describe spatial intensity transitions?',
    answer: `In digital image processing, an image is represented as a 2D intensity function I(x, y). The partial derivatives measure the instantaneous rate of change of pixel brightness along the spatial coordinates:
- I_x = ∂I / ∂x: Rate of intensity change along the horizontal axis. It produces strong responses across vertical boundaries and lines.
- I_y = ∂I / ∂y: Rate of intensity change along the vertical axis. It produces strong responses across horizontal boundaries and lines.

Together, these form the spatial gradient vector:
∇I = [ I_x , I_y ]^T

The magnitude ||∇I|| = √(I_x² + I_y²) represents edge strength, while the orientation θ = atan2(I_y, I_x) indicates the direction of greatest brightness increase. In discrete digital matrices, these derivatives are computed using convolution masks such as the Sobel operator or finite differences.`,
    math: `\\nabla I(x,y) = \\begin{bmatrix} I_x \\\\ I_y \\end{bmatrix} = \\begin{bmatrix} \\frac{\\partial I}{\\partial x} \\\\ \\frac{\\partial I}{\\partial y} \\end{bmatrix}, \\quad \\|\\nabla I\\| = \\sqrt{I_x^2 + I_y^2}`
  },
  {
    id: 'q2',
    task: 'Task 2: Structure Tensor',
    icon: Cpu,
    title: 'Gaussian Smoothing of Gradient Products & The Structure Tensor',
    question: 'Why are the gradient products smoothed and how does the structure tensor describe intensity variation in a local image neighborhood?',
    answer: `Single-pixel gradient products (I_x², I_y², I_x I_y) are highly susceptible to sensor noise and only capture instantaneous 1D slope. A single pixel cannot determine whether a point is an edge or a 2D junction.

By convolving the outer product ∇I ∇I^T with a Gaussian window w(u,v), we integrate gradient statistics over a local patch. This produces the Second-Moment Matrix (Structure Tensor):
M = ∑ w(u,v) [ I_x²  I_x·I_y ; I_x·I_y  I_y² ]

Geometrical Interpretation:
The structure tensor M describes the local auto-correlation function E(Δx, Δy) ≈ [Δx, Δy] M [Δx, Δy]^T. The eigenvalues λ₁ and λ₂ of M represent the principal curvatures of the local energy surface:
1. Flat Region: Both λ₁ ≈ 0 and λ₂ ≈ 0 (no significant intensity variation in any direction).
2. Edge Region: One eigenvalue dominates (e.g., λ₁ ≫ 0, λ₂ ≈ 0) indicating strong variation along the edge normal and zero variation along the edge tangent.
3. Corner Keypoint: Both eigenvalues are large (λ₁ > 0, λ₂ > 0) signifying rapid intensity changes in all orthogonal spatial directions.`,
    math: `M = \\sum_{(u,v) \\in W} w(u,v) \\begin{bmatrix} I_x^2(u,v) & I_x(u,v) I_y(u,v) \\\\ I_x(u,v) I_y(u,v) & I_y^2(u,v) \\end{bmatrix} = \\begin{bmatrix} \\langle I_x^2 \\rangle & \\langle I_x I_y \\rangle \\\\ \\langle I_x I_y \\rangle & \\langle I_y^2 \\rangle \\end{bmatrix}`
  },
  {
    id: 'q3',
    task: 'Task 3: Harris Response',
    icon: Zap,
    title: 'Why Determinant Alone Fails & The Harris Response Formulation',
    question: 'Why is the determinant alone insufficient to distinguish corners from edges?',
    answer: `The determinant of the structure tensor is det(M) = λ₁ · λ₂.
At first glance, one might expect det(M) to identify corners because it multiplies both eigenvalues. However, determinant alone suffers from a critical failure mode:

Consider a strong, high-contrast edge:
- λ₁ is extremely large (e.g., λ₁ = 10,000)
- λ₂ along the edge is small, but non-zero due to discrete noise or fine texture (e.g., λ₂ = 2)
- Their product is det(M) = 10,000 × 2 = 20,000!

This large positive number would cause simple determinant thresholding to mistakenly classify straight edges as corners.

The Harris formulation introduces a negative trace-penalty term:
R = det(M) - k · (trace(M))² = λ₁ λ₂ - k · (λ₁ + λ₂)²

For edges where λ₁ ≫ λ₂:
trace(M)² ≈ λ₁²
R ≈ λ₁ λ₂ - k · λ₁²  <  0  (Strictly Negative!)

Thus:
• R > 0 (Large Positive): Both λ₁ and λ₂ are large → Robust 2D Corner.
• R < 0 (Large Negative): One eigenvalue dominates → Straight Edge.
• |R| ≈ 0 (Near Zero): Both eigenvalues are small → Uniform/Flat terrain.`,
    math: `R = \\det(M) - k \\cdot (\\text{trace}(M))^2 = (\\lambda_1 \\lambda_2) - k (\\lambda_1 + \\lambda_2)^2`
  },
  {
    id: 'q4',
    task: 'Task 4: Detection & Localization',
    icon: Target,
    title: 'Cluster Formation and Non-Maximum Suppression (NMS)',
    question: 'Why does thresholding alone produce clusters of detections, and how does NMS resolve it?',
    answer: `1. Why Thresholding Alone Produces Clusters:
Because the structure tensor is smoothed by a Gaussian filter w(u,v), the resulting Harris response R(x,y) forms a smooth continuous 'hill' or 'mountain' around any physical corner point.
Applying a simple threshold R(x,y) > T cuts horizontally across this peak, selecting every pixel on the upper slopes of the hill. As a consequence, dozens of redundant candidate pixels are marked for a single physical corner.

2. How Non-Maximum Suppression (NMS) Resolves It:
Non-Maximum Suppression acts as a spatial peak detector:
- For every candidate pixel (x, y) where R(x,y) > T, NMS inspects a local neighborhood window (e.g. 3×3, 5×5, 7×7, 9×9).
- It compares R(x,y) against all its spatial neighbors.
- If R(x,y) is strictly greater than all neighbors in the window, it is identified as the true local summit and retained.
- If any neighbor has a higher response, (x, y) is discarded.

This ensures each continuous response peak is thinned to exactly one mathematically precise, localized corner keypoint.`,
    math: `(x^*, y^*) = \\arg\\max_{(u,v) \\in \\mathcal{N}(x,y)} R(u,v), \\quad \\text{where } R(x^*, y^*) > T`
  }
];

export function HarrisQuestionModal({ isOpen, onClose, activeQuestionId = 'q1' }) {
  const [selectedId, setSelectedId] = React.useState(activeQuestionId);

  React.useEffect(() => {
    if (activeQuestionId) {
      setSelectedId(activeQuestionId);
    }
  }, [activeQuestionId]);

  if (!isOpen) return null;

  const currentQ = HARRIS_QUESTIONS.find(q => q.id === selectedId) || HARRIS_QUESTIONS[0];
  const IconComponent = currentQ.icon;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-panel harris-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={20} className="modal-title-icon" />
            <div>
              <h3>Harris Corner Detection — Theoretical Reference &amp; Defense</h3>
              <p>Detailed mathematical explanations for each pipeline task</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close Guide">
            <X size={18} />
          </button>
        </div>

        {/* Question Selector Tabs */}
        <div className="harris-modal-tabs">
          {HARRIS_QUESTIONS.map(q => {
            const QIcon = q.icon;
            const isActive = q.id === selectedId;
            return (
              <button
                key={q.id}
                className={`harris-modal-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedId(q.id)}
              >
                <QIcon size={14} />
                <span>{q.task.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="modal-body harris-modal-body">
          <div className="harris-question-card">
            <div className="question-header">
              <span className="question-task-badge">{currentQ.task}</span>
              <h4 className="question-title">{currentQ.question}</h4>
            </div>

            <div className="math-box">
              <MathView latex={currentQ.math} displayMode={true} />
            </div>

            <div className="question-answer-content">
              {currentQ.answer.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="answer-p">
                  {paragraph.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {line}
                      {lIdx < paragraph.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="footer-note">Computer Vision Playground — Harris Pipeline Academic Reference</span>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Back to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

export default HarrisQuestionModal;

