class CreateResponsibleCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :responsible_categories do |t|
      t.string :name, null:false, default: ''
      t.timestamps
    end
  end
end
