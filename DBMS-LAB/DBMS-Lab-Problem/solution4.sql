DROP PROCEDURE IF EXISTS get_dept_instructors;
DELIMITER //

CREATE PROCEDURE get_dept_instructors(IN dept VARCHAR(20))
BEGIN
SELECT id, name
FROM instructor
WHERE dept_name = dept;
 END //
 
DELIMITER ;