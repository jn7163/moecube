#encoding: UTF-8
class Game_Event
  User_Filter = /<li>(：：：观战：|===决斗1=|===决斗2=)<font color="(?:blue|gray)">(.+?)(\(未认证\)|)<\/font>;<\/li>/
  Room_Filter = /<div style="width:300px; height:150px; border:1px #ececec solid; float:left;padding:5px; margin:5px;">房间名称：(.+?) (<font color=(?:\")?red(?:\")?>决斗已开始!<\/font>|<font color=(?:\")?blue(?:\")?>等待<\/font>)(<font color="#CC6633" title="竞技场，接受服务器录像、场次统计，非认证玩家不得加入">\[竞\]<\/font>|)<font size="1">\(ID：(\d+)\)<\/font>#{User_Filter}+?<\/div>/
  class AllRooms < Game_Event
    def self.parse(info)
      @rooms = []
      info.scan(Room_Filter) do |name, status, pvp, id|
        player1 = player2 = nil
        $&.scan(User_Filter) do |player, name, certified|
          if player["1"]
            player1 = User.new(name.to_sym, name, certified.empty?)
          elsif player["2"]
            player2 = User.new(name.to_sym, name, certified.empty?)
          end
        end
        room = Room.new(id.to_i, name, player1, player2, false, status["等待"] ? [0,0,255] : [255,0,0])
        if status["等待"]
          @rooms.unshift room
        else
          @rooms << room
        end
      end
      self.new @rooms
    end
  end
  class AllUsers < Game_Event
    def self.parse(info)
      @users = []
      info.scan(User_Filter) do |player, name, certified|
        @users << User.new(name.to_sym, name, certified.empty?)
      end
      self.new @users
    end
  end
end