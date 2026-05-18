import 'package:firebase_auth/firebase_auth.dart';
import 'package:restaurant_admin_app/config/firebase_config.dart';

class AuthService {
  final FirebaseAuth _auth;

  AuthService() : _auth = FirebaseConfig.instance.auth;

  /// مراقبة حالة تسجيل الدخول
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// المستخدم الحالي
  User? get currentUser => _auth.currentUser;

  /// تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
  Future<AuthResult> signInWithEmail(String email, String password) async {
    try {
      final result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return AuthResult(user: result.user, error: null);
    } on FirebaseAuthException catch (e) {
      String message;
      switch (e.code) {
        case 'user-not-found':
          message = 'لا يوجد حساب بهذا البريد الإلكتروني';
          break;
        case 'wrong-password':
          message = 'كلمة المرور غير صحيحة';
          break;
        case 'invalid-credential':
          message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          break;
        case 'too-many-requests':
          message = 'تم تعطيل تسجيل الدخول مؤقتاً. حاول لاحقاً';
          break;
        default:
          message = 'حدث خطأ في تسجيل الدخول';
      }
      return AuthResult(user: null, error: message);
    }
  }

  /// تسجيل الخروج
  Future<void> signOut() async {
    await _auth.signOut();
  }
}

class AuthResult {
  final User? user;
  final String? error;

  AuthResult({this.user, this.error});

  bool get isSuccess => user != null && error == null;
}
