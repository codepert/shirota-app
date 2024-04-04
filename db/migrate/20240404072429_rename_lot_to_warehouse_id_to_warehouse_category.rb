class RenameLotToWarehouseIdToWarehouseCategory < ActiveRecord::Migration[7.1]
  def change
    rename_column :warehouse_categories, :lot, :warehouse_id
  end
end
