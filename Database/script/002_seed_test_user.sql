CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (name, email, password_hash)
VALUES ('Usuario Prueba', 'test@example.com', crypt('Password123!', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'user'
WHERE u.email = 'test@example.com'
ON CONFLICT (user_id, role_id) DO NOTHING;
