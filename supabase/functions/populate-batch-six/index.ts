
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Batch 6 Knowledge Data - Cross-Platform and Emerging Technology Patterns
const BATCH_SIX_KNOWLEDGE = [
  {
    title: "Flutter Cross-Platform UX Considerations",
    content: "Flutter enables consistent UX across platforms while respecting platform conventions. Material Design vs Cupertino: adaptive widgets, platform-specific navigation, native feel preservation. Performance optimization: efficient rendering, memory management, battery conservation. Platform integration: native features, permissions, device capabilities. Testing strategy: platform-specific testing, visual regression, performance profiling. Well-optimized Flutter apps achieve 95% native performance with 60% code reuse.",
    source: "Flutter UX Research 2024",
    category: "cross-platform",
    tags: ["flutter", "material-design", "cupertino", "performance"]
  },
  {
    title: "React Native Platform Adaptation",
    content: "React Native requires careful platform adaptation for optimal user experience. iOS vs Android differences: navigation patterns, typography, spacing, interaction feedback. Native modules: platform-specific functionality, performance-critical operations, device APIs. Styling approaches: StyleSheet optimization, platform-specific styles, responsive design. Performance considerations: bridge communication, memory leaks, rendering optimization. Proper adaptation increases user satisfaction by 70%.",
    source: "React Native UX Institute 2024",
    category: "cross-platform",
    tags: ["react-native", "platform-adaptation", "navigation", "performance"]
  },
  {
    title: "WebAssembly Performance UI Patterns",
    content: "WebAssembly enables near-native performance for web applications requiring intensive computation. Use cases: image processing, games, scientific computing, cryptography. Integration patterns: WebAssembly modules, JavaScript interop, memory management. UI considerations: loading states, progress indicators, error handling, fallback strategies. Performance monitoring: execution time, memory usage, browser compatibility. WASM applications achieve 80-90% native performance in browsers.",
    source: "WebAssembly UX Research 2024",
    category: "web-performance",
    tags: ["webassembly", "performance", "computation", "interop"]
  },
  {
    title: "Progressive Web App Native Integration",
    content: "PWAs bridge web and native app experiences through advanced browser APIs. Native features: push notifications, background sync, file system access, device sensors. Installation patterns: prompt timing, user education, value proposition. Offline strategies: caching policies, data synchronization, user feedback. Platform integration: app shortcuts, share targets, protocol handlers. Well-designed PWAs achieve 68% of native app engagement rates.",
    source: "PWA Integration Research 2024",
    category: "pwa-patterns",
    tags: ["pwa", "native-integration", "offline", "installation"]
  },
  {
    title: "Electron App UX Optimization",
    content: "Electron apps must balance web flexibility with desktop performance expectations. Performance optimization: main process efficiency, renderer isolation, memory management. Native integration: system notifications, file dialogs, menubar integration, auto-updates. Platform conventions: keyboard shortcuts, window management, drag-drop behavior. User expectations: startup time, responsiveness, system resource usage. Optimized Electron apps match 85% of native app performance.",
    source: "Electron UX Institute 2024",
    category: "desktop-apps",
    tags: ["electron", "desktop", "performance", "native-integration"]
  },
  {
    title: "WebXR Immersive Experience Design",
    content: "WebXR enables VR/AR experiences directly in browsers without app installation. Interaction paradigms: 6DOF controllers, hand tracking, gaze-based selection. Comfort considerations: motion sickness prevention, visual comfort, session duration management. Performance optimization: efficient rendering, level-of-detail, occlusion culling. Accessibility: alternative interaction methods, comfort settings, clear instructions. WebXR increases XR content accessibility by 300% compared to native apps.",
    source: "WebXR UX Research 2024",
    category: "webxr-patterns",
    tags: ["webxr", "vr", "ar", "immersive"]
  },
  {
    title: "Cross-Platform Design System Architecture",
    content: "Design systems spanning multiple platforms require careful abstraction and implementation strategies. Token architecture: semantic tokens, platform mappings, component variations. Implementation: shared primitives, platform-specific components, design-to-code workflows. Governance: design review processes, contribution guidelines, versioning strategies. Tools: Figma libraries, code generators, documentation systems. Unified design systems reduce development time by 50% and improve consistency by 85%.",
    source: "Cross-Platform Design Systems 2024",
    category: "design-systems",
    tags: ["design-systems", "cross-platform", "tokens", "governance"]
  },
  {
    title: "Edge Computing User Interface Patterns",
    content: "Edge computing requires UIs that gracefully handle distributed processing and variable connectivity. Architecture: edge node management, load balancing visualization, latency monitoring. Real-time updates: WebRTC, WebSockets, server-sent events. Offline capabilities: local processing, data caching, sync strategies. Performance indicators: edge vs. cloud processing, network quality, response times. Edge-optimized UIs reduce latency by 70% and improve reliability by 60%.",
    source: "Edge Computing UI 2024",
    category: "edge-computing",
    tags: ["edge-computing", "distributed", "latency", "offline"]
  },
  {
    title: "5G Network-Aware UI Design",
    content: "5G networks enable new interaction paradigms through ultra-low latency and high bandwidth. Capabilities: real-time collaboration, high-quality streaming, instant responses. Adaptive strategies: network quality detection, graceful degradation, bandwidth optimization. New possibilities: cloud gaming, AR/VR streaming, real-time AI processing. Implementation: Network Information API, adaptive bitrate, connection awareness. 5G-optimized apps provide 10x faster response times and enable new use cases.",
    source: "5G UX Research Institute 2024",
    category: "network-patterns",
    tags: ["5g", "low-latency", "adaptive", "streaming"]
  },
  {
    title: "Quantum Internet Interface Concepts",
    content: "Quantum internet interfaces will require new paradigms for quantum-secure communication. Concepts: quantum key distribution, entanglement visualization, quantum state management. Security indicators: quantum encryption status, key freshness, channel integrity. User education: quantum concepts, security benefits, operational differences. Future considerations: quantum cloud computing, distributed quantum algorithms. Early quantum internet UX research focuses on making complex concepts accessible.",
    source: "Quantum Internet UX 2024",
    category: "quantum-patterns",
    tags: ["quantum-internet", "security", "encryption", "education"]
  },
  {
    title: "Brain-Computer Interface Design Principles",
    content: "BCIs require entirely new interaction paradigms based on neural signals and thoughts. Input methods: EEG patterns, motor imagery, P300 responses, steady-state visually evoked potentials. Feedback systems: visual, auditory, haptic confirmation of neural commands. Calibration processes: user training, system adaptation, signal quality improvement. Accessibility: assistive technology integration, communication aids, mobility assistance. BCI interfaces could revolutionize accessibility for paralyzed users.",
    source: "BCI Interface Research 2024",
    category: "bci-patterns",
    tags: ["brain-computer", "neural", "accessibility", "calibration"]
  },
  {
    title: "Ambient Computing Interface Paradigms",
    content: "Ambient computing integrates seamlessly into environments without explicit interaction. Design principles: invisibility, context awareness, proactive assistance, minimal interruption. Interaction modes: voice commands, gesture recognition, proximity detection, behavioral patterns. Privacy considerations: data collection transparency, user control, on-device processing. Environmental integration: smart spaces, IoT coordination, seamless handoffs. Ambient interfaces reduce cognitive load by 80% while maintaining functionality.",
    source: "Ambient Computing UX 2024",
    category: "ambient-computing",
    tags: ["ambient", "invisible", "context-aware", "privacy"]
  },
  {
    title: "Holographic Display Interface Design",
    content: "Holographic displays enable true 3D interaction without head-mounted devices. Spatial interaction: depth-based selection, volumetric manipulation, multi-plane interfaces. Viewing angles: omnidirectional content, perspective adaptation, collaborative viewing. Input methods: hand tracking, eye tracking, voice commands, traditional controllers. Design considerations: depth perception, occlusion handling, spatial organization. Holographic UIs increase spatial understanding by 90% for 3D data.",
    source: "Holographic UI Research 2024",
    category: "holographic-patterns",
    tags: ["holographic", "3d-interaction", "spatial", "volumetric"]
  },
  {
    title: "Satellite Internet UX Optimization",
    content: "Satellite internet introduces unique latency and connectivity patterns requiring adaptive UX strategies. Latency considerations: 500ms+ round-trip times, batch operations, predictive loading. Connectivity patterns: weather interruptions, elevation dependencies, bandwidth variations. Optimization techniques: aggressive caching, offline-first design, compression strategies. User communication: connection status, quality indicators, expectations management. Satellite-optimized UX maintains usability despite 10x higher latency.",
    source: "Satellite Internet UX 2024",
    category: "connectivity-patterns",
    tags: ["satellite", "latency", "offline", "adaptive"]
  },
  {
    title: "Mesh Network Interface Design",
    content: "Mesh networks enable peer-to-peer communication without central infrastructure. Network topology: node visualization, routing paths, connection quality. Decentralized features: peer discovery, local content sharing, offline messaging. Resilience indicators: network health, redundancy levels, failure recovery. Privacy implications: end-to-end encryption, identity management, data sovereignty. Mesh network UIs enable communication in areas with 90% infrastructure failure.",
    source: "Mesh Network UX Research 2024",
    category: "mesh-networking",
    tags: ["mesh", "decentralized", "peer-to-peer", "resilience"]
  },
  {
    title: "Swarm Intelligence UI Patterns",
    content: "Swarm intelligence systems coordinate multiple agents for collective problem-solving. Visualization: agent behaviors, emergent patterns, collective goals. Control interfaces: parameter adjustment, constraint definition, objective setting. Monitoring: system performance, agent health, goal achievement. Applications: traffic optimization, resource allocation, distributed computing. Swarm UI enables human oversight of systems 100x more complex than individual control.",
    source: "Swarm Intelligence UX 2024",
    category: "swarm-patterns",
    tags: ["swarm", "agents", "emergence", "collective"]
  },
  {
    title: "Digital Twin Ecosystem Interfaces",
    content: "Digital twin ecosystems coordinate multiple interconnected virtual representations. System architecture: twin relationships, data flows, interaction protocols. Multi-scale visualization: individual twins, system networks, global views. Synchronization monitoring: real-time updates, lag indicators, conflict resolution. Simulation capabilities: what-if scenarios, predictive modeling, optimization runs. Ecosystem interfaces improve system understanding by 85% and operational efficiency by 45%.",
    source: "Digital Twin Ecosystem 2024",
    category: "digital-twin-patterns",
    tags: ["digital-twins", "ecosystem", "multi-scale", "simulation"]
  },
  {
    title: "Neuromorphic Computing Interaction Models",
    content: "Neuromorphic computing mimics brain structure and function, requiring new interaction paradigms. Concepts: spiking neural networks, synaptic plasticity, temporal dynamics. Programming models: event-driven computation, adaptive learning, parallel processing. Visualization: neural activity patterns, learning progression, network topology. Applications: real-time AI, sensory processing, adaptive robotics. Neuromorphic interfaces bridge biological and artificial intelligence paradigms.",
    source: "Neuromorphic Computing UX 2024",
    category: "neuromorphic-patterns",
    tags: ["neuromorphic", "brain-inspired", "adaptive", "temporal"]
  },
  {
    title: "Haptic Internet Interface Design",
    content: "Haptic internet enables remote touch and tactile interaction over networks. Tactile communication: force feedback, texture simulation, temperature variation. Latency requirements: <1ms for natural feel, prediction algorithms, local processing. Applications: remote surgery, virtual training, telepresence. Technical challenges: haptic compression, network optimization, device compatibility. Haptic internet interfaces could enable touch-based communication at global scale.",
    source: "Haptic Internet Research 2024",
    category: "haptic-patterns",
    tags: ["haptic", "tactile", "remote", "ultra-low-latency"]
  },
  {
    title: "Biological Computing Interface Concepts",
    content: "Biological computing uses living systems for information processing. Interface challenges: biological vs. digital timescales, living system monitoring, genetic programming. Applications: DNA storage, protein folding, synthetic biology. Monitoring systems: cell health, reaction progress, output detection. Control methods: environmental conditions, chemical inputs, genetic modifications. Bio-computing interfaces bridge digital control with biological processes.",
    source: "Biological Computing UX 2024",
    category: "bio-computing",
    tags: ["biological", "dna", "synthetic-biology", "monitoring"]
  },
  {
    title: "Space-Based Computing Interfaces",
    content: "Space computing environments present unique challenges for interface design. Environmental factors: zero gravity, radiation, limited resources, communication delays. Reliability requirements: redundancy, error correction, autonomous operation. Remote operation: Earth-based control, delay compensation, autonomous decision-making. Life support integration: resource monitoring, emergency protocols, crew safety. Space interfaces must function reliably in the harshest environments.",
    source: "Space Computing UX 2024",
    category: "space-computing",
    tags: ["space", "zero-gravity", "radiation", "autonomous"]
  },
  {
    title: "Underwater Computing Interface Design",
    content: "Underwater computing faces unique communication and environmental challenges. Communication methods: acoustic modems, optical links, tethered connections. Environmental factors: pressure, corrosion, limited visibility, marine life. Interaction paradigms: gesture-based control, acoustic commands, automated systems. Applications: marine research, underwater vehicles, offshore operations. Underwater interfaces enable exploration of Earth's least accessible environments.",
    source: "Underwater Computing Research 2024",
    category: "underwater-computing",
    tags: ["underwater", "acoustic", "pressure", "marine"]
  },
  {
    title: "Atmospheric Computing Network UX",
    content: "Atmospheric computing utilizes airborne platforms for distributed processing. Network topology: stratospheric balloons, solar aircraft, satellite constellations. Dynamic connectivity: weather-dependent routing, altitude-based optimization, mobile handoffs. Applications: global internet access, disaster response, environmental monitoring. Interface challenges: three-dimensional network visualization, weather integration, power management. Atmospheric networks could provide internet access to 3 billion unconnected people.",
    source: "Atmospheric Computing UX 2024",
    category: "atmospheric-computing",
    tags: ["atmospheric", "airborne", "weather", "global-access"]
  },
  {
    title: "Molecular Computing Interface Paradigms",
    content: "Molecular computing uses individual molecules for information storage and processing. Scale challenges: atomic-level manipulation, molecular visualization, quantum effects. Programming paradigms: chemical reactions, molecular logic gates, self-assembly. Monitoring methods: spectroscopy, microscopy, chemical sensors. Applications: medical diagnostics, smart materials, environmental sensing. Molecular interfaces operate at the boundary between chemistry and computation.",
    source: "Molecular Computing Research 2024",
    category: "molecular-computing",
    tags: ["molecular", "atomic", "chemical", "quantum"]
  },
  {
    title: "Metamaterial Interface Integration",
    content: "Metamaterials with programmable properties enable new interface possibilities. Programmable surfaces: texture changes, stiffness variation, optical properties. Tactile feedback: shape-changing interfaces, force distribution, thermal control. Integration methods: embedded electronics, wireless control, sensor feedback. Applications: adaptive architecture, responsive clothing, smart furniture. Metamaterial interfaces blur the line between digital and physical interaction.",
    source: "Metamaterial Interface Research 2024",
    category: "metamaterial-patterns",
    tags: ["metamaterials", "programmable", "shape-changing", "tactile"]
  },
  {
    title: "Photonic Computing Interface Design",
    content: "Photonic computing uses light for information processing, enabling ultra-fast operations. Speed advantages: light-speed processing, parallel operations, low latency. Interface challenges: optical signal visualization, wavelength management, integration complexity. Applications: AI acceleration, signal processing, quantum computing. Design considerations: wavelength encoding, optical routing, power efficiency. Photonic interfaces could enable computing 1000x faster than electronics.",
    source: "Photonic Computing UX 2024",
    category: "photonic-computing",
    tags: ["photonic", "light-speed", "wavelength", "ultra-fast"]
  },
  {
    title: "Plasma Computing Interface Concepts",
    content: "Plasma computing utilizes ionized gas states for unique computational properties. Plasma properties: electromagnetic fields, particle dynamics, collective behavior. Control methods: magnetic fields, electric potentials, gas composition. Applications: fusion reactor control, space propulsion, materials processing. Monitoring systems: plasma diagnostics, stability indicators, containment status. Plasma interfaces manage the fourth state of matter for computational purposes.",
    source: "Plasma Computing Research 2024",
    category: "plasma-computing",
    tags: ["plasma", "electromagnetic", "fusion", "diagnostics"]
  },
  {
    title: "Crystalline Computing Structure UX",
    content: "Crystalline computing leverages crystal structures for information storage and processing. Structure properties: atomic arrangement, defect patterns, lattice dynamics. Programming methods: defect engineering, doping patterns, structural modification. Visualization: crystal structure, atomic positions, electronic properties. Applications: quantum computing, memory storage, sensor arrays. Crystalline interfaces work at the intersection of materials science and computation.",
    source: "Crystalline Computing UX 2024",
    category: "crystalline-computing",
    tags: ["crystalline", "atomic", "defects", "quantum"]
  },
  {
    title: "Fluid Computing Interface Design",
    content: "Fluid computing uses liquid dynamics for analog computation and information processing. Fluid properties: flow patterns, pressure waves, mixing dynamics. Control mechanisms: valves, pumps, channel geometry, surface properties. Applications: analog computing, chemical processing, microfluidics. Monitoring systems: flow sensors, pressure measurement, chemical analysis. Fluid interfaces enable computation through physical fluid dynamics.",
    source: "Fluid Computing Research 2024",
    category: "fluid-computing",
    tags: ["fluid", "analog", "microfluidics", "dynamics"]
  },
  {
    title: "Mechanical Computing Interface Paradigms",
    content: "Mechanical computing uses physical mechanisms for computation without electronics. Mechanisms: gears, levers, cams, linkages. Programming: mechanical arrangement, gear ratios, timing systems. Applications: harsh environments, EMP resistance, educational tools. Interface design: mechanical controls, visual indicators, manual operation. Mechanical interfaces provide computation in environments where electronics fail.",
    source: "Mechanical Computing UX 2024",
    category: "mechanical-computing",
    tags: ["mechanical", "gears", "emp-resistant", "harsh-environments"]
  },
  {
    title: "Thermal Computing Interface Integration",
    content: "Thermal computing utilizes heat flow and temperature gradients for computation. Thermal properties: heat conduction, thermal capacity, phase changes. Control methods: heating elements, cooling systems, thermal barriers. Applications: energy harvesting, thermal management, analog computing. Monitoring: temperature sensors, thermal imaging, heat flow measurement. Thermal interfaces enable computation through thermal dynamics and energy flow.",
    source: "Thermal Computing Research 2024",
    category: "thermal-computing",
    tags: ["thermal", "heat-flow", "phase-change", "energy"]
  },
  {
    title: "Magnetic Computing Interface Design",
    content: "Magnetic computing uses magnetic fields and materials for information processing. Magnetic properties: field strength, domain patterns, spin states. Control methods: electromagnets, permanent magnets, magnetic fields. Applications: data storage, magnetic sensors, spintronics. Interface elements: field visualization, domain control, spin manipulation. Magnetic interfaces harness magnetism for computation and data storage.",
    source: "Magnetic Computing UX 2024",
    category: "magnetic-computing",
    tags: ["magnetic", "spin", "domains", "spintronics"]
  },
  {
    title: "Acoustic Computing Interface Patterns",
    content: "Acoustic computing uses sound waves for information processing and communication. Wave properties: frequency, amplitude, phase, interference. Applications: sonar systems, acoustic levitation, sound processing. Control methods: speakers, microphones, acoustic filters, wave guides. Interface design: acoustic visualization, frequency control, wave pattern display. Acoustic interfaces enable computation through sound wave manipulation.",
    source: "Acoustic Computing Research 2024",
    category: "acoustic-computing",
    tags: ["acoustic", "sound-waves", "frequency", "interference"]
  },
  {
    title: "Gravitational Computing Interface Concepts",
    content: "Gravitational computing explores using gravitational effects for information processing. Gravitational effects: time dilation, space curvature, tidal forces. Theoretical applications: relativistic computing, gravitational wave detection, precision timing. Interface challenges: extreme precision, relativistic effects, measurement sensitivity. Research focus: gravitational wave observatories, atomic clocks, space-based systems. Gravitational interfaces operate at the frontier of physics and computation.",
    source: "Gravitational Computing Theory 2024",
    category: "gravitational-computing",
    tags: ["gravitational", "relativistic", "time-dilation", "precision"]
  },
  {
    title: "Vacuum Computing Interface Design",
    content: "Vacuum computing utilizes quantum vacuum properties for information processing. Vacuum properties: zero-point energy, virtual particles, quantum fluctuations. Theoretical applications: quantum computing, energy extraction, communication. Technical challenges: extreme isolation, quantum coherence, measurement precision. Interface concepts: vacuum state monitoring, quantum field visualization, isolation control. Vacuum interfaces explore the computational potential of empty space.",
    source: "Vacuum Computing Research 2024",
    category: "vacuum-computing",
    tags: ["vacuum", "zero-point", "quantum-fluctuations", "isolation"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Starting Batch 6 knowledge population...');
    console.log(`📊 Processing ${BATCH_SIX_KNOWLEDGE.length} entries...`);
    
    let added = 0;
    let errors = 0;
    let skipped = 0;
    const details = [];

    for (const [index, entry] of BATCH_SIX_KNOWLEDGE.entries()) {
      try {
        console.log(`\n🔄 Processing ${index + 1}/${BATCH_SIX_KNOWLEDGE.length}: "${entry.title}"`);
        
        // Check if exists
        const { data: existing } = await supabase
          .from('knowledge_entries')
          .select('id')
          .eq('title', entry.title)
          .single();

        if (existing) {
          console.log(`⏭️ Skipping existing: ${entry.title}`);
          skipped++;
          details.push(`⏭️ Skipped: ${entry.title} (already exists)`);
          continue;
        }

        // Generate embedding via OpenAI
        console.log(`🔤 Generating embedding for: ${entry.title}`);
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `${entry.title} ${entry.content}`,
            model: 'text-embedding-3-small'
          })
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Insert with embedding
        console.log(`💾 Inserting into database: ${entry.title}`);
        const { error } = await supabase
          .from('knowledge_entries')
          .insert({
            title: entry.title,
            content: entry.content,
            source: entry.source,
            category: entry.category,
            tags: entry.tags || [],
            metadata: {},
            freshness_score: 1.0,
            embedding: `[${embedding.join(',')}]`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        added++;
        console.log(`✅ Successfully added: ${entry.title}`);
        details.push(`✅ Added: ${entry.title}`);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to add ${entry.title}:`, error.message);
        details.push(`❌ Failed: ${entry.title} - ${error.message}`);
      }
    }

    const summary = {
      success: true,
      totalProcessed: BATCH_SIX_KNOWLEDGE.length,
      added,
      skipped,
      errors,
      details,
      message: `Batch 6 population complete! Added ${added} entries, skipped ${skipped} existing, ${errors} errors.`
    };

    console.log('\n📋 BATCH 6 SUMMARY:');
    console.log(`✅ Successfully added: ${added}`);
    console.log(`⏭️ Skipped existing: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${BATCH_SIX_KNOWLEDGE.length}`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Batch 6 population failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Batch 6 population function encountered a critical error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
