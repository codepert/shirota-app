class AddWarehouseCategoryReferenceToStockInouts < ActiveRecord::Migration[7.1]
   def up
    add_reference :stock_inouts, :warehouse_category, foreign_key: { to_table: :warehouse_categories }
  end

  def down
    remove_reference :stock_inouts, :warehouse_category, foreign_key: { to_table: :warehouse_categories } 
  end
end
