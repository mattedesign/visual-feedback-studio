
export const batchThreeKnowledge = [
  {
    title: "Mobile Touch Target Guidelines",
    content: "Touch targets should be at least 44x44 pixels (iOS) or 48x48dp (Android) for optimal usability. Larger targets (60px+) are better for users with motor impairments. Spacing between targets should be at least 8px to prevent accidental taps. Thumb-friendly zones are easier to reach on larger screens. Studies show properly sized touch targets reduce input errors by 40% and improve user satisfaction scores by 25%.",
    source: "Mobile UX Guidelines 2024",
    category: "mobile-ux",
    tags: ["touch-targets", "mobile", "accessibility", "thumb-zones"]
  },
  {
    title: "Gesture-Based Navigation Patterns",
    content: "Modern mobile interfaces rely heavily on gestures: swipe, pinch, tap, long press, force touch. Common patterns: swipe for navigation, pinch for zoom, pull-to-refresh, swipe-to-delete. Discoverability is key - users must learn gesture availability. Provide visual hints and fallback options. Gesture consistency across the app is crucial for user mental models. Custom gestures should feel natural and not conflict with system gestures.",
    source: "Mobile Interaction Research 2024",
    category: "mobile-ux",
    tags: ["gestures", "mobile-navigation", "interaction", "discoverability"]
  },
  {
    title: "Screen Reader Accessibility",
    content: "Screen readers translate visual interfaces into audio. Key practices: semantic HTML, meaningful alt text, proper heading hierarchy, skip navigation links, focus management. ARIA labels provide additional context when HTML semantics aren't sufficient. Screen reader users navigate by headings, landmarks, and links. Testing with actual screen readers is essential - automated tools catch only 25% of accessibility issues.",
    source: "Web Accessibility Initiative 2024",
    category: "accessibility",
    tags: ["screen-readers", "aria", "semantic-html", "focus-management"]
  },
  {
    title: "Color Contrast and Visual Accessibility",
    content: "WCAG requires 4.5:1 contrast ratio for normal text, 3:1 for large text. Color blindness affects 8% of men and 0.5% of women. Never rely on color alone to convey information. Use patterns, icons, or text labels as alternatives. High contrast modes benefit users with low vision. Tools like contrast checkers help validate designs. Good contrast improves readability for all users, not just those with disabilities.",
    source: "Color Accessibility Research 2024",
    category: "accessibility",
    tags: ["color-contrast", "color-blindness", "wcag", "visual-accessibility"]
  },
  {
    title: "Keyboard Navigation Design",
    content: "All interactive elements must be keyboard accessible. Tab order should follow logical reading flow. Visible focus indicators are required - default browser outlines are often insufficient. Skip links help users bypass navigation. Modal dialogs should trap focus. Keyboard shortcuts can enhance power user efficiency. Test without a mouse to identify navigation gaps.",
    source: "Keyboard Accessibility Institute 2024",
    category: "accessibility",
    tags: ["keyboard-navigation", "focus-indicators", "tab-order", "skip-links"]
  },
  {
    title: "Swipe Interaction Patterns",
    content: "Swipe gestures enable efficient mobile interaction. Common patterns: horizontal swipe for carousels/tabs, vertical for scrolling, swipe-to-delete for list items, pull-to-refresh for content updates. Provide visual feedback during swipe actions. Threshold distances should be comfortable - typically 20-30% of screen width. Implement momentum and bounce effects for natural feel. Always provide alternative interaction methods for accessibility.",
    source: "Mobile Gesture Research 2024",
    category: "mobile-ux",
    tags: ["swipe-gestures", "mobile-interaction", "feedback", "momentum"]
  },
  {
    title: "One-Handed Mobile Usage",
    content: "75% of mobile interactions are one-handed. Thumb reach zones vary by device size. Place primary actions in easy-reach areas. Bottom navigation is more accessible than top navigation on large screens. Consider left-handed users (10% of population). Floating action buttons should be positioned for thumb access. Test designs on actual devices, not just desktop simulators.",
    source: "One-Handed Usage Studies 2024",
    category: "mobile-ux",
    tags: ["one-handed", "thumb-reach", "device-size", "bottom-navigation"]
  },
  {
    title: "Progressive Web App UX",
    content: "PWAs bridge web and native app experiences. Key UX considerations: app-like navigation, offline functionality, push notifications, home screen installation. Loading performance is critical - aim for <3 second first paint. Service workers enable offline experiences. App shell architecture provides instant loading. PWAs can achieve 90% of native app functionality with web technologies.",
    source: "PWA UX Research 2024",
    category: "mobile-ux",
    tags: ["pwa", "offline", "app-shell", "service-workers"]
  },
  {
    title: "Mobile Form Design",
    content: "Mobile forms require special consideration due to screen constraints and input methods. Use appropriate input types to trigger correct keyboards. Label positioning should accommodate various screen sizes. Group related fields and minimize form length. Auto-complete and smart defaults reduce typing. Inline validation provides immediate feedback. Progress indicators help with longer forms.",
    source: "Mobile Form UX 2024",
    category: "mobile-ux",
    tags: ["mobile-forms", "input-types", "inline-validation", "auto-complete"]
  },
  {
    title: "Alternative Text Best Practices",
    content: "Alt text describes images for screen readers and when images fail to load. Be descriptive but concise. Decorative images should have empty alt attributes. Complex images may need longer descriptions. Context matters - same image might need different alt text in different contexts. Don't start with 'image of' or 'picture of'. Good alt text benefits SEO and accessibility equally.",
    source: "Alt Text Guidelines 2024",
    category: "accessibility",
    tags: ["alt-text", "screen-readers", "seo", "image-description"]
  },
  {
    title: "Motion and Animation Accessibility",
    content: "Some users experience motion sensitivity or vestibular disorders. Provide reduced motion preferences. CSS prefers-reduced-motion media query respects user settings. Essential motion can remain, but decorative animations should be disabled. Parallax effects and auto-playing videos are particularly problematic. Motion should enhance, not hinder, the user experience.",
    source: "Motion Accessibility Research 2024",
    category: "accessibility",
    tags: ["motion-sensitivity", "reduced-motion", "vestibular", "animation"]
  },
  {
    title: "Focus Management in SPAs",
    content: "Single Page Applications need careful focus management. Route changes should move focus to main content or page heading. Modal dialogs should trap and restore focus. Screen readers need to be notified of content changes. Live regions announce dynamic content updates. Focus management is crucial for keyboard users and screen reader users navigating SPAs.",
    source: "SPA Accessibility Guide 2024",
    category: "accessibility",
    tags: ["focus-management", "spa", "live-regions", "route-changes"]
  },
  {
    title: "Mobile Typography Guidelines",
    content: "Mobile typography faces unique challenges: smaller screens, various viewing distances, different lighting conditions. Minimum font size should be 16px to prevent zoom on iOS. Line height of 1.4-1.6 improves readability. Contrast is more critical on mobile due to outdoor usage. Font choice affects readability - avoid decorative fonts for body text. White space prevents text from feeling cramped.",
    source: "Mobile Typography Research 2024",
    category: "mobile-ux",
    tags: ["mobile-typography", "font-size", "line-height", "readability"]
  },
  {
    title: "Haptic Feedback Design",
    content: "Haptic feedback provides tactile responses to user interactions. Types: notification feedback, impact feedback, selection feedback. Use sparingly to maintain effectiveness. Match haptic intensity to interaction importance. Provide user controls to disable haptics. Different devices have different haptic capabilities. Good haptic design feels natural and reinforces visual feedback.",
    source: "Haptic Design Guidelines 2024",
    category: "mobile-ux",
    tags: ["haptic-feedback", "tactile", "mobile-interaction", "user-control"]
  },
  {
    title: "Mobile Navigation Patterns",
    content: "Mobile navigation must work within screen constraints. Patterns: tab bars, hamburger menus, bottom sheets, floating action buttons. Tab bars work best for 3-5 top-level sections. Hamburger menus hide navigation but save space. Bottom navigation is thumb-friendly. Consider navigation depth and breadcrumbs for complex hierarchies. Test navigation with one-handed usage scenarios.",
    source: "Mobile Navigation UX 2024",
    category: "mobile-ux",
    tags: ["mobile-navigation", "tab-bars", "hamburger-menu", "bottom-navigation"]
  },
  {
    title: "Inclusive Design Principles",
    content: "Inclusive design considers diverse abilities, contexts, and preferences from the start. Principles: recognize exclusion, learn from diversity, solve for one to extend to many. Consider permanent, temporary, and situational disabilities. Design for different cultures, languages, and technologies. Inclusive design benefits everyone - curb cuts help wheelchairs and wheeled luggage alike.",
    source: "Inclusive Design Institute 2024",
    category: "accessibility",
    tags: ["inclusive-design", "diversity", "universal-design", "disability"]
  },
  {
    title: "Screen Size Adaptation Strategies",
    content: "Responsive design must work across device sizes from smartwatches to large displays. Use fluid grids and flexible images. Content prioritization becomes crucial on smaller screens. Consider foldable devices and changing orientations. Test on actual devices, not just browser resize. Progressive enhancement ensures basic functionality on all devices.",
    source: "Responsive Design Evolution 2024",
    category: "responsive-design",
    tags: ["screen-sizes", "fluid-grids", "content-prioritization", "foldable"]
  },
  {
    title: "Voice Control and Speech Recognition",
    content: "Voice control provides hands-free interaction and accessibility benefits. Design for natural language patterns, not rigid commands. Provide feedback for voice recognition status. Handle recognition errors gracefully. Consider background noise and different accents. Voice interfaces should complement, not replace, traditional input methods. Privacy concerns require transparent voice data handling.",
    source: "Voice Control UX 2024",
    category: "accessibility",
    tags: ["voice-control", "speech-recognition", "natural-language", "privacy"]
  },
  {
    title: "Cognitive Accessibility Design",
    content: "Cognitive disabilities affect information processing, memory, and attention. Design principles: simple language, clear instructions, consistent navigation, error prevention, memory aids. Avoid time limits or provide extensions. Use clear visual hierarchy and white space. Provide multiple ways to complete tasks. Test with users who have cognitive disabilities for authentic feedback.",
    source: "Cognitive Accessibility Research 2024",
    category: "accessibility",
    tags: ["cognitive-accessibility", "simple-language", "memory-aids", "clear-instructions"]
  },
  {
    title: "Touch Gesture Accessibility",
    content: "Touch gestures can be difficult for users with motor impairments. Provide alternative input methods for all gestures. Complex gestures (multi-finger, precise timing) should have simpler alternatives. Drag and drop operations need keyboard equivalents. Consider tremor and limited dexterity when designing gesture thresholds. Always provide traditional tap alternatives.",
    source: "Touch Accessibility Guidelines 2024",
    category: "accessibility",
    tags: ["touch-accessibility", "motor-impairments", "gesture-alternatives", "dexterity"]
  }
];
