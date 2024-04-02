class AddWarehouseReferenceToProducts < ActiveRecord::Migration[7.1]
  def up
    add_reference :products, :warehouse, foreign_key: { to_table: :warehouses }, null: false, default: 1
  end

  def down
    remove_reference :products, :warehouse, foreign_key: { to_table: :warehouses }
  end
end
