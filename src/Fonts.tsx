import React from 'react';

export default function Fonts() {
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: 'Plus Jakarta Sans';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('${prefix}/fonts/plus-jakarta-sans/PlusJakartaSans-Regular.woff2') format('woff2');
          }

          @font-face {
            font-family: 'Plus Jakarta Sans';
            font-style: normal;
            font-weight: 500;
            font-display: swap;
            src: url('${prefix}/fonts/plus-jakarta-sans/PlusJakartaSans-Medium.woff2') format('woff2');
          }

          @font-face {
            font-family: 'Plus Jakarta Sans';
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url('${prefix}/fonts/plus-jakarta-sans/PlusJakartaSans-Bold.woff2') format('woff2');
          }

          @font-face {
            font-family: 'Plus Jakarta Sans';
            font-style: italic;
            font-weight: 400;
            font-display: swap;
            src: url('${prefix}/fonts/plus-jakarta-sans/PlusJakartaSans-Italic.woff2') format('woff2');
          }

          @font-face {
            font-family: 'Plus Jakarta Sans';
            font-style: italic;
            font-weight: 700;
            font-display: swap;
            src: url('${prefix}/fonts/plus-jakarta-sans/PlusJakartaSans-BoldItalic.woff2') format('woff2');
          }
        `,
      }}
    />
  );
}
