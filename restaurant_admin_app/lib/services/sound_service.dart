import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// خدمة الصوت — تشغيل صوت تنبيه عند وصول طلب جديد
class SoundService {
  static final SoundService _instance = SoundService._();
  factory SoundService() => _instance;
  SoundService._();

  AudioPlayer? _player;
  String? _soundFilePath;
  bool _initialized = false;

  /// مفتاح حفظ حالة الصوت في SharedPreferences
  static const String _soundEnabledKey = 'notification_sound_enabled';

  /// هل الصوت مفعّل؟
  bool _soundEnabled = true;
  bool get isSoundEnabled => _soundEnabled;

  /// تهيئة الخدمة — توليد ملف الصوت وقراءة الإعدادات
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // قراءة الإعدادات
      final prefs = await SharedPreferences.getInstance();
      _soundEnabled = prefs.getBool(_soundEnabledKey) ?? true;

      // توليد ملف الصوت
      await _generateSoundFile();

      // إنشاء مشغل الصوت
      _player = AudioPlayer();
      _player!.setVolume(0.8);

      _initialized = true;
      debugPrint('🔊 SoundService initialized (enabled: $_soundEnabled)');
    } catch (e) {
      debugPrint('⚠️ SoundService init failed: $e');
    }
  }

  /// تفعيل/تعطيل الصوت
  Future<void> setSoundEnabled(bool enabled) async {
    _soundEnabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_soundEnabledKey, enabled);
    debugPrint('🔊 Notification sound: ${enabled ? "ON" : "OFF"}');
  }

  /// تشغيل صوت التنبيه
  Future<void> playNotificationSound() async {
    if (!_soundEnabled || _player == null || _soundFilePath == null) return;

    try {
      await _player!.stop();
      await _player!.play(DeviceFileSource(_soundFilePath!));
      debugPrint('🔊 Playing notification sound');
    } catch (e) {
      debugPrint('⚠️ Could not play notification sound: $e');
    }
  }

  /// توليد ملف WAV لصوت التنبيه
  Future<void> _generateSoundFile() async {
    try {
      // معاملات الصوت — صوت قصير ثنائي النغمة
      const sampleRate = 8000;
      const duration = 0.4; // 0.4 ثانية
      const freq1 = 880.0; // نغمة أولى
      const freq2 = 660.0; // نغمة ثانية
      final numSamples = (sampleRate * duration).toInt();
      final halfSamples = numSamples ~/ 2;

      final samples = Int16List(numSamples);

      for (int i = 0; i < numSamples; i++) {
        double freq;
        double volume;

        if (i < halfSamples) {
          // النغمة الأولى (عالية)
          freq = freq1;
          volume = 1.0;
        } else {
          // النغمة الثانية (أخفض)
          freq = freq2;
          volume = 0.85;
        }

        // تطبيق fade-in/fade-out سريع لمنع الـ click
        final env = i < 100
            ? i / 100.0
            : (numSamples - i < 100
                ? (numSamples - i) / 100.0
                : 1.0);

        final value = (math.sin(2 * math.pi * freq * i / sampleRate) * 8000 * volume * env).toInt();
        samples[i] = value;
      }

      // بناء ملف WAV
      final byteData = ByteData(44 + numSamples * 2);
      int offset = 0;

      void writeString(String s) {
        for (int i = 0; i < s.length; i++) {
          byteData.setUint8(offset++, s.codeUnitAt(i));
        }
      }

      void writeInt16(int value) {
        byteData.setInt16(offset, value, Endian.little);
        offset += 2;
      }

      void writeInt32(int value) {
        byteData.setInt32(offset, value, Endian.little);
        offset += 4;
      }

      // RIFF header
      writeString('RIFF');
      writeInt32(36 + numSamples * 2);
      writeString('WAVE');

      // fmt chunk
      writeString('fmt ');
      writeInt32(16); // chunk size
      writeInt16(1); // PCM
      writeInt16(1); // mono
      writeInt32(sampleRate);
      writeInt32(sampleRate * 2); // byte rate
      writeInt16(2); // block align
      writeInt16(16); // bits per sample

      // data chunk
      writeString('data');
      writeInt32(numSamples * 2);

      for (int i = 0; i < numSamples; i++) {
        writeInt16(samples[i]);
      }

      // حفظ الملف في المجلد المؤقت
      final tempDir = Directory.systemTemp;
      final soundFile = File('${tempDir.path}/notification_sound.wav');
      await soundFile.writeAsBytes(byteData.buffer.asUint8List());
      _soundFilePath = soundFile.path;

      debugPrint('🔊 Sound file generated: $_soundFilePath');
    } catch (e) {
      debugPrint('⚠️ Could not generate sound file: $e');
      rethrow;
    }
  }

  /// تنظيف الموارد
  void dispose() {
    _player?.dispose();
    _player = null;
  }
}
