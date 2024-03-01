class AddLoginIdToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :login_id, :string
    add_index :users, :login_id, unique: true
  end
end
