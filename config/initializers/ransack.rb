Ransack.configure do |config|
                       # 述語名
  config.add_predicate 'lteq_of_day',
                       arel_predicate: 'lteq',
                       formatter: proc { |v| v.of_day }
  config.add_predicate 'rteq_of_day',
                       arel_predicate: 'rteq',
                       formatter: proc { |v| v.of_day }
end