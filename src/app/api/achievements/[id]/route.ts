import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

// GET /api/achievements/[id] - Get achievement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Check if it's a badge ID or achievement ID
    const isBadge = id.startsWith('badge_');
    
    if (isBadge) {
      // Get badge details
      const [badgeRows] = await connection.execute(
        'SELECT * FROM achievement_badges WHERE id = ?',
        [id]
      );
      
      if ((badgeRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Badge tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Get santri who have earned this badge
      const [achievementRows] = await connection.execute(
        `SELECT sa.*, s.name as santriName, s.nis as santriNis, s.photo as santriPhoto
         FROM santri_achievements sa
         JOIN santri s ON sa.santriId = s.id
         WHERE sa.badgeId = ?
         ORDER BY sa.achievedAt DESC`,
        [id]
      );
      
      return NextResponse.json({
        success: true,
        badge: (badgeRows as any[])[0],
        achievements: achievementRows
      });
      
    } else {
      // Get achievement details
      const [achievementRows] = await connection.execute(
        `SELECT sa.*, s.name as santriName, s.nis as santriNis, s.photo as santriPhoto,
                ab.name as badgeName, ab.nameArabic as badgeNameArabic, ab.description as badgeDescription,
                ab.icon as badgeIcon, ab.color as badgeColor, ab.category as badgeCategory,
                ab.rarity as badgeRarity, ab.points as badgePoints
         FROM santri_achievements sa
         JOIN santri s ON sa.santriId = s.id
         JOIN achievement_badges ab ON sa.badgeId = ab.id
         WHERE sa.id = ?`,
        [id]
      );
      
      if ((achievementRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Achievement tidak ditemukan' },
          { status: 404 }
        );
      }
      
      const achievement = (achievementRows as any[])[0];
      
      // Parse metadata if it exists
      if (achievement.metadata && typeof achievement.metadata === 'string') {
        achievement.metadata = JSON.parse(achievement.metadata);
      }
      
      return NextResponse.json({
        success: true,
        achievement
      });
    }
    
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil data achievement',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT /api/achievements/[id] - Update achievement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    const body = await request.json();
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Check if it's a badge ID or achievement ID
    const isBadge = id.startsWith('badge_');
    
    if (isBadge) {
      // Update badge
      const {
        name,
        nameArabic,
        description,
        icon,
        color,
        category,
        criteriaType,
        criteriaValue,
        criteriaCondition,
        timeframe,
        rarity,
        points,
        isActive,
        unlockMessage,
        shareMessage
      } = body;
      
      // Check if badge exists
      const [existingRows] = await connection.execute(
        'SELECT * FROM achievement_badges WHERE id = ?',
        [id]
      );
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Badge tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Prepare update data
      const updateData: any = {};
      const queryParams: any[] = [];
      
      if (name !== undefined) updateData.name = name;
      if (nameArabic !== undefined) updateData.nameArabic = nameArabic;
      if (description !== undefined) updateData.description = description;
      if (icon !== undefined) updateData.icon = icon;
      if (color !== undefined) updateData.color = color;
      if (category !== undefined) updateData.category = category;
      if (criteriaType !== undefined) updateData.criteriaType = criteriaType;
      if (criteriaValue !== undefined) updateData.criteriaValue = criteriaValue;
      if (criteriaCondition !== undefined) updateData.criteriaCondition = criteriaCondition;
      if (timeframe !== undefined) updateData.timeframe = timeframe;
      if (rarity !== undefined) updateData.rarity = rarity;
      if (points !== undefined) updateData.points = points;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (unlockMessage !== undefined) updateData.unlockMessage = unlockMessage;
      if (shareMessage !== undefined) updateData.shareMessage = shareMessage;
      
      // Build update query
      let query = 'UPDATE achievement_badges SET ';
      const setClauses = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        setClauses.push(`${key} = ?`);
        queryParams.push(value);
      }
      
      query += setClauses.join(', ');
      query += ' WHERE id = ?';
      queryParams.push(id);
      
      // Execute update
      await connection.execute(query, queryParams);
      
      // Get updated badge
      const [updatedRows] = await connection.execute(
        'SELECT * FROM achievement_badges WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Badge berhasil diperbarui',
        badge: (updatedRows as any[])[0]
      });
      
    } else {
      // Update achievement
      const {
        progress,
        isUnlocked,
        notificationSent,
        certificateGenerated,
        certificateUrl,
        sharedAt,
        metadata
      } = body;
      
      // Check if achievement exists
      const [existingRows] = await connection.execute(
        'SELECT * FROM santri_achievements WHERE id = ?',
        [id]
      );
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Achievement tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Prepare update data
      const updateData: any = {};
      const queryParams: any[] = [];
      
      if (progress !== undefined) updateData.progress = progress;
      if (isUnlocked !== undefined) updateData.isUnlocked = isUnlocked;
      if (notificationSent !== undefined) updateData.notificationSent = notificationSent;
      if (certificateGenerated !== undefined) updateData.certificateGenerated = certificateGenerated;
      if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;
      if (sharedAt !== undefined) updateData.sharedAt = sharedAt;
      if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);
      
      // Build update query
      let query = 'UPDATE santri_achievements SET ';
      const setClauses = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        setClauses.push(`${key} = ?`);
        queryParams.push(value);
      }
      
      query += setClauses.join(', ');
      query += ' WHERE id = ?';
      queryParams.push(id);
      
      // Execute update
      await connection.execute(query, queryParams);
      
      // Get updated achievement
      const [updatedRows] = await connection.execute(
        `SELECT sa.*, s.name as santriName, ab.name as badgeName
         FROM santri_achievements sa
         JOIN santri s ON sa.santriId = s.id
         JOIN achievement_badges ab ON sa.badgeId = ab.id
         WHERE sa.id = ?`,
        [id]
      );
      
      const achievement = (updatedRows as any[])[0];
      
      // Parse metadata if it exists
      if (achievement.metadata && typeof achievement.metadata === 'string') {
        achievement.metadata = JSON.parse(achievement.metadata);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Achievement berhasil diperbarui',
        achievement
      });
    }
    
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal memperbarui achievement',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE /api/achievements/[id] - Delete achievement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Check if it's a badge ID or achievement ID
    const isBadge = id.startsWith('badge_');
    
    if (isBadge) {
      // Check if badge exists
      const [existingRows] = await connection.execute(
        'SELECT * FROM achievement_badges WHERE id = ?',
        [id]
      );
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Badge tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Check if badge is used in any achievements
      const [usageRows] = await connection.execute(
        'SELECT COUNT(*) as count FROM santri_achievements WHERE badgeId = ?',
        [id]
      );
      
      const usageCount = (usageRows as any[])[0].count;
      
      if (usageCount > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Badge tidak dapat dihapus karena digunakan oleh ${usageCount} achievement` 
          },
          { status: 400 }
        );
      }
      
      // Delete badge
      await connection.execute(
        'DELETE FROM achievement_badges WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Badge berhasil dihapus'
      });
      
    } else {
      // Check if achievement exists
      const [existingRows] = await connection.execute(
        'SELECT * FROM santri_achievements WHERE id = ?',
        [id]
      );
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: 'Achievement tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Delete achievement
      await connection.execute(
        'DELETE FROM santri_achievements WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Achievement berhasil dihapus'
      });
    }
    
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menghapus achievement',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}