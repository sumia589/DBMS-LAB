drop trigger if exists check_salary;
delimiter //

create trigger check_salary
before insert on instructor
for each row
begin 
if new.salary>150000 then
set new.salary=150000;
end if;
end //

delimiter ;