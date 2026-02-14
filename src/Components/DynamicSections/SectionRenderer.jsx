import React from 'react';
import TabbedGridSection from './TabbedGridSection';
import HorizontalScrollSection from './HorizontalScrollSection';

const SectionRenderer = React.memo(({ section }) => {
  switch (section.type) {
    case 'tabbed-grid':
      return <TabbedGridSection section={section} />;
    case 'horizontal-scroll':
      return <HorizontalScrollSection section={section} />;
    default:
      console.warn(`Unknown section type: ${section.type}`);
      return null;
  }
});

export default SectionRenderer;
