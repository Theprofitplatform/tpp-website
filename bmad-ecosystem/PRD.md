# Product Requirements Document (PRD)
## Bmad Ecosystem - Accelerator Physics Simulation Platform

**Document Version:** 1.0
**Date:** September 2025
**Product Owner:** Bmad Development Team
**Target Release:** Continuous Delivery Model

---

## 1. Executive Summary

### 1.1 Product Vision
Bmad is a comprehensive, open-source toolkit for simulating charged particles and X-rays in accelerators and storage rings. It serves as the industry-standard platform for accelerator physics calculations, enabling researchers and engineers to design, optimize, and operate particle accelerators worldwide.

### 1.2 Value Proposition
- **Comprehensive Physics**: Complete modeling of particle dynamics, optics, and collective effects
- **High Performance**: Optimized Fortran core with parallel processing capabilities
- **Multi-Language Support**: Native bindings for Python, C++, and Julia
- **Industry Standard**: Trusted by major accelerator facilities globally
- **Open Source**: Free, community-driven development with transparent governance

### 1.3 Success Metrics
| Metric | Current | Target (2026) |
|--------|---------|--------------|
| Active Users | 500+ | 1000+ |
| GitHub Stars | 150+ | 300+ |
| Installations/Month | 200+ | 500+ |
| Response Time (99th percentile) | <100ms | <50ms |
| Simulation Accuracy | 99.95% | 99.99% |

---

## 2. Product Overview

### 2.1 Problem Statement
Particle accelerator design and operation requires sophisticated simulation tools that can:
- Model complex electromagnetic fields and particle dynamics
- Handle multi-particle effects and collective phenomena
- Integrate with control systems and optimization frameworks
- Scale from single elements to entire accelerator complexes
- Provide accurate predictions for billion-dollar facilities

### 2.2 Solution
Bmad provides a unified ecosystem that addresses these challenges through:
- Modular architecture supporting diverse accelerator types
- High-fidelity physics models validated against real machines
- Flexible APIs for integration with external tools
- Performance optimization for large-scale simulations
- Comprehensive documentation and support

### 2.3 Target Users

#### Primary Users
1. **Accelerator Physicists**
   - Need: Accurate beam dynamics simulations
   - Use Case: Lattice design, optics calculations
   - Expertise: PhD level physics, programming experience

2. **Control Room Operators**
   - Need: Real-time modeling and predictions
   - Use Case: Machine tuning, fault diagnosis
   - Expertise: Operations training, basic scripting

3. **Research Scientists**
   - Need: Advanced physics capabilities
   - Use Case: Novel accelerator concepts, beam physics studies
   - Expertise: Deep physics knowledge, computational skills

#### Secondary Users
1. **Engineering Teams**
   - Component design and integration
   - Tolerance analysis and specifications

2. **Graduate Students**
   - Learning accelerator physics
   - Thesis research projects

3. **Industry Partners**
   - Medical accelerator design
   - Industrial applications

---

## 3. Core Features & Requirements

### 3.1 Physics Capabilities

#### P1 - Critical Features
| Feature | Description | Acceptance Criteria |
|---------|-------------|-------------------|
| Particle Tracking | Single and multi-particle tracking through elements | <1% error vs analytical solutions |
| Transfer Maps | Linear and nonlinear transfer matrices | Symplecticity preserved to 10^-12 |
| Twiss Calculations | Beta functions, phase advance, chromaticity | Match MAD-X to 0.01% |
| Synchrotron Radiation | Classical and quantum radiation effects | Energy loss accurate to 0.1% |
| Space Charge | 3D space charge calculations | Benchmarked against IMPACT-T |

#### P2 - Important Features
| Feature | Description | Status |
|---------|-------------|--------|
| Spin Dynamics | Polarized beam evolution | Complete |
| Wake Fields | Short and long-range wakes | Complete |
| Beam-Beam Effects | Collision point interactions | In Development |
| CSR (Coherent Synchrotron Radiation) | Collective radiation effects | Complete |
| IBS (Intrabeam Scattering) | Multiple Coulomb scattering | Complete |

### 3.2 Supported Elements

#### Magnets
- [x] Dipoles (sector, rectangular, exact)
- [x] Quadrupoles (normal, skew, fringe fields)
- [x] Sextupoles, Octupoles, Higher multipoles
- [x] Combined function magnets
- [x] Solenoids
- [x] Wiggler/Undulator elements

#### RF Systems
- [x] Standing wave cavities
- [x] Traveling wave structures
- [x] Crab cavities
- [x] Higher harmonic cavities

#### Special Elements
- [x] Collimators (rectangular, elliptical)
- [x] Kickers (injection, extraction)
- [x] Beam position monitors
- [x] Custom field maps

### 3.3 User Interface Requirements

#### Command Line Interface (Tao)
```
Requirement: Interactive command-line tool for lattice manipulation
Priority: P1
Acceptance Criteria:
- Command response time <100ms
- Tab completion for commands
- Comprehensive help system
- Scriptable via input files
```

#### Python API (PyTao)
```python
# Required Interface Pattern
from pytao import Tao
tao = Tao(lattice_file='my_lattice.bmad')
tao.cmd('set element Q1[K1] = 0.5')
orbit = tao.orbit_at_element('BPM1')
```

#### Graphical Capabilities
- 2D/3D lattice visualization
- Phase space plots
- Optics function displays
- Real-time parameter adjustment

### 3.4 Performance Requirements

| Metric | Requirement | Measurement |
|--------|------------|------------|
| Single Particle Tracking | 1M turns/second | Standard storage ring |
| Multi-particle Tracking | 10k particles, 1k turns < 1 min | 6D phase space |
| Optics Calculation | Full ring < 100ms | 1000 element lattice |
| Memory Usage | < 2GB baseline | Typical simulation |
| Parallel Scaling | >80% efficiency | Up to 128 cores |

### 3.5 Integration Requirements

#### File Format Support
- [x] Bmad native format (.bmad)
- [x] MAD-X (.madx)
- [x] Elegant (.lte)
- [x] SAD (.sad)
- [x] SXF (Standard eXchange Format)
- [ ] OPAL (planned)

#### API Specifications
```yaml
REST API:
  Protocol: HTTP/HTTPS
  Format: JSON
  Authentication: Token-based
  Rate Limiting: 1000 req/min

Python API:
  Version: Python 3.8+
  Package: pytao (PyPI)
  Documentation: Sphinx

C++ API:
  Standard: C++17
  Linking: Static/Dynamic
  Headers: bmad.hpp
```

---

## 4. Technical Specifications

### 4.1 System Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
│   (User Programs, Scripts, GUIs)    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          API Layer                  │
│   (PyTao, C++ Bindings, REST)       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Core Services                │
│  (Tao, BSIM, Lux, Long_term_tracking) │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Physics Engine (Bmad)          │
│   (Fortran Libraries, Algorithms)    │
└─────────────────────────────────────┘
```

### 4.2 Development Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Core Engine | Fortran | 2008+ |
| Build System | CMake | 3.18+ |
| Python Bindings | ctypes/f2py | 3.8+ |
| Documentation | Doxygen/Sphinx | Latest |
| Testing | pytest/CMake | Latest |
| CI/CD | GitHub Actions | Latest |

### 4.3 Deployment Options

1. **Local Installation**
   - Conda: `conda install -c conda-forge bmad`
   - Source compilation with CMake
   - Docker containers

2. **HPC Deployment**
   - MPI support for cluster computing
   - SLURM/PBS integration
   - Module system compatible

3. **Cloud Deployment**
   - AWS/GCP/Azure support
   - Kubernetes orchestration
   - Auto-scaling capabilities

---

## 5. User Stories & Use Cases

### 5.1 Epic: Lattice Design

**User Story 1: Create New Accelerator Design**
```
As an accelerator physicist,
I want to design a new storage ring lattice,
So that I can optimize beam parameters for my experiment.

Acceptance Criteria:
- Define elements with physical parameters
- Calculate optics functions
- Verify stability and dynamic aperture
- Export to standard formats
```

**User Story 2: Optimize Existing Lattice**
```
As a machine operator,
I want to optimize quadrupole strengths,
So that I can achieve target beta functions at interaction points.

Acceptance Criteria:
- Load existing lattice file
- Define optimization variables and constraints
- Run optimization algorithm
- Validate solution with tracking
```

### 5.2 Epic: Beam Dynamics Studies

**User Story 3: Collective Effects Analysis**
```
As a beam physicist,
I want to simulate impedance-driven instabilities,
So that I can determine stability thresholds.

Acceptance Criteria:
- Define impedance model
- Track multi-bunch dynamics
- Calculate growth rates
- Generate stability diagrams
```

### 5.3 Epic: Control System Integration

**User Story 4: Real-time Model**
```
As a control room operator,
I want a real-time model synchronized with the machine,
So that I can predict effects of parameter changes.

Acceptance Criteria:
- Connect to EPICS/Tango control system
- Update model from live measurements
- Calculate predictions in <100ms
- Display results on operator screens
```

---

## 6. Non-Functional Requirements

### 6.1 Reliability
- **Uptime**: 99.9% availability for cloud services
- **Error Handling**: Graceful degradation, comprehensive error messages
- **Data Integrity**: Checksums for critical calculations
- **Backup**: Automatic state saving during long simulations

### 6.2 Security
- **Access Control**: Role-based permissions for multi-user systems
- **Data Protection**: Encryption for sensitive lattice designs
- **Audit Trail**: Logging of all parameter modifications
- **Compliance**: Export control for certain accelerator types

### 6.3 Usability
- **Documentation**: Comprehensive user manual, API docs, tutorials
- **Learning Curve**: Basic functionality accessible within 1 day
- **Error Messages**: Clear, actionable error descriptions
- **Examples**: 50+ working examples covering common use cases

### 6.4 Maintainability
- **Code Quality**: >80% test coverage, static analysis
- **Modularity**: Clear separation of physics modules
- **Version Control**: Semantic versioning, detailed changelogs
- **Backward Compatibility**: 2 major versions supported

---

## 7. Roadmap & Release Planning

### 7.1 Current Release (v2025.09)
- [x] Core physics engine
- [x] Python bindings (PyTao)
- [x] Basic optimization framework
- [x] HDF5 data support
- [x] Parallel tracking

### 7.2 Next Release (v2025.12)
- [ ] GPU acceleration for tracking
- [ ] Machine learning integration
- [ ] Enhanced beam-beam models
- [ ] Web-based interface prototype
- [ ] Improved error handling

### 7.3 Future Releases (2026)
- [ ] Cloud-native architecture
- [ ] Real-time collaboration features
- [ ] AI-assisted optimization
- [ ] Digital twin capabilities
- [ ] Advanced visualization (VR/AR)

### 7.4 Long-term Vision (2027+)
- Quantum computing integration
- Plasma acceleration support
- Multi-physics coupling (thermal, mechanical)
- Automated design generation
- Industry-specific packages

---

## 8. Dependencies & Constraints

### 8.1 Technical Dependencies
- **Libraries**: LAPACK, BLAS, HDF5, MPI
- **Compilers**: GFortran 9+, Intel Fortran
- **Python**: NumPy, SciPy, Matplotlib
- **Build Tools**: CMake, Make, pkg-config

### 8.2 Constraints
- **Performance**: Must maintain real-time capability
- **Accuracy**: Physics fidelity cannot be compromised
- **Compatibility**: Support legacy lattice formats
- **Resources**: Limited development team (5-10 FTE)

### 8.3 Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking API changes | Medium | High | Deprecation policy, version pinning |
| Performance regression | Low | High | Automated benchmarking, CI/CD |
| Dependency conflicts | Medium | Medium | Containerization, vendoring |
| User adoption | Low | Medium | Documentation, workshops, support |

---

## 9. Success Criteria & KPIs

### 9.1 Launch Criteria
- [ ] All P1 features implemented and tested
- [ ] Documentation complete and reviewed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] User acceptance testing completed

### 9.2 Success Metrics
| KPI | Target | Measurement Method |
|-----|--------|-------------------|
| User Adoption | 20% increase YoY | Download statistics |
| Performance | <50ms response time | Automated benchmarks |
| Reliability | <5 bugs/month | Issue tracking |
| User Satisfaction | >4.0/5.0 | Survey, feedback |
| Community Growth | 50+ contributors | GitHub metrics |

### 9.3 OKRs
**Objective**: Establish Bmad as the leading open-source accelerator physics platform

**Key Results**:
1. Achieve 1000+ active users by end of 2026
2. Support 90% of accelerator element types
3. Reduce simulation time by 50% through optimization
4. Publish 10+ peer-reviewed papers using Bmad

---

## 10. Stakeholder Analysis

### 10.1 Stakeholder Map
| Stakeholder | Interest | Influence | Engagement Strategy |
|-------------|----------|-----------|-------------------|
| Core Developers | High | High | Weekly meetings, code reviews |
| National Labs | High | High | Quarterly reviews, funding proposals |
| Universities | High | Medium | Workshops, training programs |
| Industry Users | Medium | Medium | User groups, support channels |
| Open Source Community | Medium | Low | GitHub, forums, conferences |

### 10.2 Communication Plan
- **Release Notes**: With each version release
- **Blog Posts**: Monthly updates on features
- **Conferences**: Annual presence at IPAC, NA-PAC
- **Training**: Bi-annual workshops
- **Support**: GitHub issues, mailing list, Slack

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Bmad | Beam Dynamics (simulation toolkit) |
| Tao | Tool for Accelerator Optics |
| PyTao | Python interface to Tao |
| Lattice | Arrangement of accelerator elements |
| Optics | Beam envelope functions |
| Tracking | Particle trajectory calculation |
| Transfer Map | Mathematical transformation through element |
| Twiss Parameters | Beam envelope description |
| CSR | Coherent Synchrotron Radiation |
| IBS | Intrabeam Scattering |

---

## Appendix B: References

1. Bmad Manual: https://www.classe.cornell.edu/bmad/manual.html
2. Tao Manual: https://www.classe.cornell.edu/bmad/tao.html
3. GitHub Repository: https://github.com/bmad-sim/bmad-ecosystem
4. Physics References:
   - S.Y. Lee, "Accelerator Physics"
   - H. Wiedemann, "Particle Accelerator Physics"
5. Related Tools:
   - MAD-X (CERN)
   - Elegant (ANL)
   - OPAL (PSI)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-09-20 | PM Team | Initial PRD creation |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |
| Stakeholder Rep | | | |