-- Apply once after the phase-one migration. No resources or personal data are seeded.
insert into public.hub_courses(id,name,program,summary,visible,display_order) values
('bca-digital-logic','Digital Logic','TU BCA','Explore logic, digital circuits, and the foundations of computing.',true,1),
('bca-c-programming','C Programming','TU BCA','Build a practical foundation in structured programming with C.',true,2),
('csit-compiler-design','Compiler Design','TU BSc CSIT','Understand how programming languages are translated and implemented.',true,3),
('csit-cryptography','Cryptography','TU BSc CSIT','Study the principles behind secure communication and information protection.',true,4),
('csit-discrete-mathematics','Discrete Mathematics','TU BSc CSIT','Develop mathematical reasoning for computer science.',true,5),
('csit-numerical-methods','Numerical Methods','TU BSc CSIT','Approach mathematical problems through computational methods.',true,6)
on conflict(id) do nothing;
