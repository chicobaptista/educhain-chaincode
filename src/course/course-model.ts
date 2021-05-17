import { Object } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'
import { CoursePersistence } from './course-persistence'

@Object()
export class CourseModel {
  public id: uuidv4
  public name: string
  public duration: number
  public instructor: uuidv4
  public students: uuidv4[]

  static mapToPersistence(course: CourseModel): CoursePersistence {
    return {
      id: course.id,
      name: course.name,
      duration: course.duration,
      instructor: course.instructor.toString(),
      students: JSON.stringify(course.students)
    }
  }

  static mapFromPersistence(pCourse: CoursePersistence): CourseModel {
    return {
      id: pCourse.id,
      name: pCourse.name,
      duration: pCourse.duration,
      instructor: pCourse.instructor,
      students: JSON.parse(pCourse.students)
    }
  }
}
