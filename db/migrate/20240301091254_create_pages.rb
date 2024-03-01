class CreatePages < ActiveRecord::Migration[7.1]
  def change
    create_table :pages do |t|
      t.string :name
      t.string :path
      t.integer :parent_id
      t.timestamps
    end
  end
end
