const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPostgreSQLConnection() {
  console.log('🧪 Testing PostgreSQL Integration...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test user creation
    console.log('2. Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@kiu.edu.ge',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        password: 'hashedpassword',
        pin: '1234',
        major: 'Computer Science',
        dateOfBirth: new Date('2000-01-01'),
        startYear: 2023
      }
    });
    console.log('✅ User created successfully:', testUser.id);

    // Test post creation
    console.log('\n3. Testing post creation...');
    const testPost = await prisma.post.create({
      data: {
        authorId: testUser.id,
        content: 'This is a test post for PostgreSQL integration',
        isPublic: true
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });
    console.log('✅ Post created successfully:', testPost.id);

    // Test comment creation
    console.log('\n4. Testing comment creation...');
    const testComment = await prisma.comment.create({
      data: {
        postId: testPost.id,
        authorId: testUser.id,
        content: 'This is a test comment'
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });
    console.log('✅ Comment created successfully:', testComment.id);

    // Test message creation
    console.log('\n5. Testing message creation...');
    const testMessage = await prisma.message.create({
      data: {
        senderId: testUser.id,
        recipientId: testUser.id,
        content: 'This is a test message',
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        recipient: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });
    console.log('✅ Message created successfully:', testMessage.id);

    // Test friendship creation
    console.log('\n6. Testing friendship creation...');
    const testFriend = await prisma.user.create({
      data: {
        email: 'friend@kiu.edu.ge',
        firstName: 'Friend',
        lastName: 'User',
        username: 'frienduser',
        password: 'hashedpassword',
        pin: '5678',
        major: 'Engineering',
        dateOfBirth: new Date('2001-01-01'),
        startYear: 2023
      }
    });

    const friendship = await prisma.userFriend.createMany({
      data: [
        { userId: testUser.id, friendId: testFriend.id },
        { userId: testFriend.id, friendId: testUser.id }
      ]
    });
    console.log('✅ Friendship created successfully');

    // Test post like
    console.log('\n7. Testing post like...');
    const postLike = await prisma.postLike.create({
      data: {
        userId: testUser.id,
        postId: testPost.id
      }
    });
    console.log('✅ Post like created successfully');

    // Test comment like
    console.log('\n8. Testing comment like...');
    const commentLike = await prisma.commentLike.create({
      data: {
        userId: testUser.id,
        commentId: testComment.id
      }
    });
    console.log('✅ Comment like created successfully');

    // Test user search
    console.log('\n9. Testing user search...');
    const searchResults = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Test', mode: 'insensitive' } },
          { lastName: { contains: 'User', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true
      }
    });
    console.log('✅ User search successful, found:', searchResults.length, 'users');

    // Test complex query (posts with author and comments)
    console.log('\n10. Testing complex query...');
    const postsWithDetails = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                username: true
              }
            }
          }
        },
        likes: {
          select: {
            id: true
          }
        }
      },
      take: 5
    });
    console.log('✅ Complex query successful, found:', postsWithDetails.length, 'posts');

    console.log('\n🎉 All PostgreSQL tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- Database connection: ✅');
    console.log('- User operations: ✅');
    console.log('- Post operations: ✅');
    console.log('- Comment operations: ✅');
    console.log('- Message operations: ✅');
    console.log('- Friendship operations: ✅');
    console.log('- Like operations: ✅');
    console.log('- Search operations: ✅');
    console.log('- Complex queries: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.postLike.deleteMany({
        where: { userId: { contains: 'test' } }
      });
      await prisma.commentLike.deleteMany({
        where: { userId: { contains: 'test' } }
      });
      await prisma.userFriend.deleteMany({
        where: { userId: { contains: 'test' } }
      });
      await prisma.message.deleteMany({
        where: { content: { contains: 'test' } }
      });
      await prisma.comment.deleteMany({
        where: { content: { contains: 'test' } }
      });
      await prisma.post.deleteMany({
        where: { content: { contains: 'test' } }
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'test' } }
      });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message);
    }

    await prisma.$disconnect();
  }
}

// Run the test
testPostgreSQLConnection();
