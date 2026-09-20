-- Public subject catalog used by authenticated assignment and material workflows.
-- Run after schema.sql. Re-running updates existing subject records by slug.
-- Semester is stored on each program-specific material because several subjects
-- appear in different semesters across BCA, CSIT, and BE.

insert into public.subjects (name, slug, program, semester, summary)
values
  ('C Programming', 'c-programming', 'BCA / CSIT / BE', null, 'Students learn to translate problems into structured C programs through regular practice with control flow, functions, arrays, pointers, files, and debugging.'),
  ('Digital Logic', 'digital-logic', 'BCA / CSIT / BE', null, 'This course connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.'),
  ('Microprocessor and Assembly Language', 'microprocessor-and-assembly-language', 'CSIT / BE', null, 'Students examine processor architecture, instruction execution, memory and I/O interfacing, interrupts, and assembly-language programming through practical exercises.'),
  ('Java Programming', 'java-programming', 'BCA / CSIT', null, 'The course develops object-oriented programming skills through classes, interfaces, exception handling, collections, and small applications.'),
  ('Data Structures and Algorithms', 'data-structures-and-algorithms', 'BCA / CSIT / BE', null, 'Students learn to select, implement, and evaluate data structures and algorithms using complexity analysis and problem-solving exercises.'),
  ('Computer Networking', 'computer-networking', 'BCA / CSIT / BE', null, 'The course develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.'),
  ('Cryptography', 'cryptography', 'CSIT / BE', null, 'Students study encryption, hashing, digital signatures, authentication, and key exchange, with attention to their use in protecting modern systems.'),
  ('Compiler Design', 'compiler-design', 'CSIT / BE', null, 'The course follows a source program through lexical analysis, parsing, semantic analysis, intermediate-code generation, and optimization.'),
  ('Quantum Computing', 'quantum-computing', 'BCA / CSIT / BE', null, 'An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.'),
  ('Numerical Methods', 'numerical-methods', 'BCA / CSIT / BE', null, 'Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.'),
  ('Database Management System', 'database-management-system', 'BCA / CSIT / BE', null, 'The course moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.'),
  ('Cybersecurity Fundamentals', 'cybersecurity-fundamentals', 'BCA / CSIT / BE', null, 'Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.'),
  ('IoT and Embedded Systems', 'iot-and-embedded-systems', 'CSIT / BE', null, 'Students design small connected systems using sensors, microcontrollers, communication protocols, data collection, and dashboard-based monitoring.'),
  ('Research Methodology', 'research-methodology', 'BCA / CSIT / BE', null, 'Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.')
on conflict (slug) do update set
  name = excluded.name,
  program = excluded.program,
  semester = excluded.semester,
  summary = excluded.summary;
