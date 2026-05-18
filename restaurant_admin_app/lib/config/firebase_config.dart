import 'package:flutter/widgets.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../firebase_options.dart';

class FirebaseConfig {
  static FirebaseConfig? _instance;
  late final FirebaseApp app;
  late final FirebaseFirestore firestore;
  late final FirebaseAuth auth;
  late final FirebaseMessaging messaging;

  FirebaseConfig._();

  static Future<FirebaseConfig> init() async {
    if (_instance != null) return _instance!;

    WidgetsFlutterBinding.ensureInitialized();

    app = await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    final instance = FirebaseConfig._();
    instance.firestore = FirebaseFirestore.instance;
    instance.auth = FirebaseAuth.instance;
    instance.messaging = FirebaseMessaging.instance;

    // Firestore settings
    instance.firestore.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );

    _instance = instance;
    return instance;
  }

  static FirebaseConfig get instance {
    if (_instance == null) {
      throw Exception('FirebaseConfig not initialized. Call FirebaseConfig.init() first.');
    }
    return _instance!;
  }
}
