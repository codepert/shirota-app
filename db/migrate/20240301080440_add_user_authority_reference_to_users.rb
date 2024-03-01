class AddUserAuthorityReferenceToUsers < ActiveRecord::Migration[7.1]
  def up
    add_reference :users, :user_authority, foreign_key: { to_table: :user_authorities }, null: false
  end

  def down
    remove_reference :users, :user_authority, foreign_key: { to_table: :user_authorities }
  end
end
