class AddResponsibleCategoryReferenceToWarehouses < ActiveRecord::Migration[7.1]
  def up
    add_reference :warehouses, :responsible_category, foreign_key: { to_table: :responsible_categories }
  end

  def down
    remove_reference :warehouses, :responsible_category, foreign_key: { to_table: :responsible_categories } 
  end
end
