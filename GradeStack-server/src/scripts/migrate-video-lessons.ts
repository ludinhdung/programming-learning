/**
 * Migration script to clean up placeholder video lessons
 * 
 * This script finds modules with video information and removes any placeholder video lessons
 * that might have been created with the old approach.
 */

import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateVideoLessons() {
  try {
    console.log('Starting video lessons migration...');
    
    // Find all modules with video information
    const modulesWithVideo = await prisma.module.findMany({
      where: {
        videoUrl: { not: null }
      },
      include: {
        lessons: {
          where: {
            lessonType: LessonType.VIDEO
          },
          include: {
            video: true
          }
        }
      }
    });
    
    console.log(`Found ${modulesWithVideo.length} modules with video information`);
    
    // Process each module
    for (const module of modulesWithVideo) {
      console.log(`Processing module: ${module.id} - ${module.title}`);
      
      // Find placeholder video lessons
      const placeholderLessons = module.lessons.filter(lesson => 
        lesson.video && 
        (lesson.video.url === 'placeholder-url-to-be-updated-later' || 
         lesson.video.duration === 0)
      );
      
      console.log(`Found ${placeholderLessons.length} placeholder lessons to clean up`);
      
      // Delete placeholder video lessons
      for (const lesson of placeholderLessons) {
        console.log(`Deleting placeholder lesson: ${lesson.id} - ${lesson.title}`);
        
        // Delete the video lesson first (due to foreign key constraint)
        if (lesson.video) {
          await prisma.videoLesson.delete({
            where: { id: lesson.video.id }
          });
        }
        
        // Then delete the lesson
        await prisma.lesson.delete({
          where: { id: lesson.id }
        });
      }
      
      console.log(`Successfully cleaned up placeholder lessons for module: ${module.id}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateVideoLessons();
