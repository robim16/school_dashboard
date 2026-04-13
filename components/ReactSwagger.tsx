'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
  return (
    <div className="swagger-dark-theme rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <style jsx global>{`
        .swagger-ui {
          filter: invert(88%) hue-rotate(180deg) brightness(1.2);
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info .title {
          color: #00e5ff;
        }
        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 4px;
        }
      `}</style>
      <SwaggerUI spec={spec} />
    </div>
  );
}

export default ReactSwagger;
