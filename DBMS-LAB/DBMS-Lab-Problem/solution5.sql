drop procedure if exists register_student;
delimiter //

create procedure register_student(
in sid varchar(20),
in cid varchar(10),
in sec varchar(5),
in sem varchar(10),
in yr int
)
begin
insert into takes(ID,course_id,sec_id,semester,year,grade)
values(sid,cid,sec,sem,yr,null);
end //

delimiter ;