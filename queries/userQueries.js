const addUser = `INSERT INTO public.users(
	id, username, password, email, role)
	VALUES ($1, $2, $3, $4, $5);`;

const getUserFromUsername = `SELECT id, username, password, email, role, created_at
	FROM public.users WHERE username = $1`;
const getUserFromUserid = `SELECT id, username, password, email, role, created_at
FROM public.users WHERE id = $1`;

const profile = `SELECT 
u.id AS user_id,
u.username,
u.email,
u.role,
u.created_at AS user_created_at,
    json_agg(
        json_build_object(
            'item_id', i.id,
            'name', i.name,
            'description', i.description,
            'starting_price', i.starting_price,
            'current_price', i.current_price,
            'image_url', i.image_url,
            'end_time', i.end_time,
            'created_at', i.created_at
        )	
) AS items
FROM 
users u
LEFT JOIN 
items i ON u.id = i.user_id
WHERE 
u.id = $1
GROUP BY 
u.id;
`;

const update_password = `UPDATE public.users
SET  password=$2
WHERE id = $1`;
module.exports = {
  addUser,
  getUserFromUsername,
  getUserFromUserid,
  profile,
  update_password,
};
