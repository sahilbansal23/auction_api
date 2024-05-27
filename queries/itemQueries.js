const getitems = `SELECT 
id,
name,
description,
starting_price,
current_price,
image_url,
end_time,
created_at,
user_id
FROM 
items
ORDER BY 
created_at DESC
LIMIT $1 OFFSET $2;
`;

const getitembyid = `SELECT 
id,
name,
description,
starting_price,
current_price,
image_url,
end_time,
created_at,
user_id
FROM 
items
WHERE 
id = $1;
`;

const addItem = `INSERT INTO items (
    id,
    name,
    description,
    starting_price,
    current_price,
    image_url,
    end_time,
    user_id
) VALUES ( $1, $2, $3, $4, $4, $5, $6, $7)`;

const updateItem = `UPDATE items
SET 
    name = COALESCE($2, name),
    description = COALESCE($3, description),
    starting_price = COALESCE($4, starting_price),
    end_time = COALESCE($5, end_time)
WHERE 
    id = $1`;

const deleteItem = `DELETE FROM items
    WHERE 
        id = $1`;

const itemCount = `SELECT COALESCE(COUNT(*), 0) as item_count FROM items`;

const getitembids = `SELECT 
bids.id AS bid_id,
bids.bid_amount,
bids.created_at AS bid_time,
COALESCE(users.username, 'Unknown') AS bidder_name,
items.id AS item_id,
items.name AS item_name,
items.description AS item_description,
items.starting_price AS item_starting_price,
items.current_price AS item_current_price,
items.image_url AS item_image_url,
items.end_time AS item_end_time
FROM 
bids
LEFT JOIN 
users ON bids.user_id = users.id
JOIN 
items ON bids.item_id = items.id
WHERE 
bids.item_id = $1
ORDER BY 
bids.created_at DESC;
`;
const addbid = `INSERT INTO public.bids(
	id, item_id, user_id, bid_amount)
	VALUES ($1, $2, $3, $4)`;

const updatePrice = `UPDATE items
SET 
    current_price = COALESCE($2, current_price) 
WHERE  id = $1`;
module.exports = {
  getitems,
  getitembyid,
  addItem,
  updateItem,
  deleteItem,
  itemCount,
  getitembids,
  addbid,
  updatePrice,
};
