class AddResponsibleCategoryReferenceToShippers < ActiveRecord::Migration[7.1]
   def up
    add_reference :shippers, :responsible_category, foreign_key: { to_table: :responsible_categories }
  end

  def down
    remove_reference :shippers, :responsible_category, foreign_key: { to_table: :responsible_categories }
  end
end
