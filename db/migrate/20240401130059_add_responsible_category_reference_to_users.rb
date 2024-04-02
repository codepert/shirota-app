class AddResponsibleCategoryReferenceToUsers < ActiveRecord::Migration[7.1]
  def up
    add_reference :users, :responsible_category, foreign_key: { to_table: :responsible_categories }
  end

  def down
    remove_reference :users, :responsible_category, foreign_key: { to_table: :responsible_categories }
  end
end
