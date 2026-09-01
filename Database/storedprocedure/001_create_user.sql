CREATE OR REPLACE PROCEDURE create_user(
    IN p_name VARCHAR(120),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    INOUT p_user_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_role_id BIGINT;
BEGIN
    INSERT INTO users (name, email, password_hash)
    VALUES (TRIM(p_name), LOWER(TRIM(p_email)), p_password_hash)
    RETURNING id INTO p_user_id;

    SELECT id INTO user_role_id FROM roles WHERE name = 'user';
    IF user_role_id IS NULL THEN
        RAISE EXCEPTION 'Required role user does not exist';
    END IF;

    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, user_role_id);
END;
$$;
