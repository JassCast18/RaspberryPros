const { pool } = require('../config/database');

const publicUserColumns = `
  u.id,
  u.name,
  u.email,
  u.is_active AS "isActive",
  u.created_at AS "createdAt",
  u.updated_at AS "updatedAt",
  COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
`;

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    roles: row.roles
  };
}

async function createUser({ name, email, passwordHash }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, email, passwordHash]
    );
    const userId = userResult.rows[0].id;
    const roleResult = await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = 'user'`,
      [userId]
    );
    if (roleResult.rowCount !== 1) throw new Error('Required role user does not exist');
    await client.query('COMMIT');
    return findUserById(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash AS "passwordHash", u.is_active AS "isActive",
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE LOWER(u.email) = $1
     GROUP BY u.id`,
    [email]
  );
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  );
  return mapUser(result.rows[0]);
}

async function listUsers() {
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     GROUP BY u.id
     ORDER BY u.id ASC`
  );
  return result.rows.map(mapUser);
}

module.exports = { createUser, findUserByEmail, findUserById, listUsers };
