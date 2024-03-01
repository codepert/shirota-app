class CreateAuthorityPages < ActiveRecord::Migration[7.1]
  def change
    create_table :authority_pages do |t|
      t.belongs_to :user_authority, null:false
      t.belongs_to :pages,          null:false
      t.boolean :is_edit,           null:false, default:false
      t.boolean :is_read,           null:false, default:false
      t.timestamps
    end
  end
end
