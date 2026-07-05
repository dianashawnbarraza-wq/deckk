-- Guarded inventory decrement for webhook (returns true if successful)
create or replace function decrement_product_inventory(
  p_product_id uuid,
  p_quantity int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_qty int;
begin
  select inventory_qty into current_qty
  from products
  where id = p_product_id
  for update;

  if not found then
    return false;
  end if;

  if current_qty is null then
    return true;
  end if;

  if current_qty < p_quantity then
    return false;
  end if;

  update products
  set inventory_qty = current_qty - p_quantity
  where id = p_product_id;

  return true;
end;
$$;
