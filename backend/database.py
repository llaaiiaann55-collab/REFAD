import sqlite3
import os
import json
from datetime import datetime, date

DB_PATH = os.path.join(os.path.dirname(__file__), "refad.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Create tables
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        role TEXT NOT NULL, -- 'nurse', 'receiving_nurse', 'supervisor'
        employee_id TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        floor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        shift_type TEXT NOT NULL, -- 'morning', 'evening', 'night'
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mrn TEXT UNIQUE NOT NULL, -- Medical Record Number
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        room TEXT NOT NULL,
        bed TEXT NOT NULL,
        department TEXT NOT NULL,
        condition TEXT NOT NULL, -- 'critical', 'stable', 'observation'
        diagnosis_ar TEXT NOT NULL,
        diagnosis_en TEXT NOT NULL,
        admission_date TEXT NOT NULL,
        allergies TEXT,
        code_status TEXT NOT NULL DEFAULT 'Full Code',
        diet TEXT,
        mobility TEXT,
        gcs INTEGER DEFAULT 15,
        last_updated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nurse_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nurse_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        shift_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(nurse_id) REFERENCES users(id),
        FOREIGN KEY(patient_id) REFERENCES patients(id),
        FOREIGN KEY(shift_id) REFERENCES shifts(id)
    );

    CREATE TABLE IF NOT EXISTS vital_signs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        recorded_at TEXT NOT NULL,
        bp_systolic INTEGER NOT NULL,
        bp_diastolic INTEGER NOT NULL,
        heart_rate INTEGER NOT NULL,
        temperature REAL NOT NULL,
        respiratory_rate INTEGER NOT NULL,
        spo2 INTEGER NOT NULL,
        recorded_by INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS medication_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        dose TEXT NOT NULL,
        route TEXT NOT NULL,
        frequency TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL, -- 'administered', 'pending', 'held'
        administered_at TEXT,
        notes TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS laboratory_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        test_name_ar TEXT NOT NULL,
        test_name_en TEXT NOT NULL,
        ordered_at TEXT NOT NULL,
        status TEXT NOT NULL, -- 'completed', 'pending', 'cancelled'
        result_value TEXT,
        normal_range TEXT,
        specimen_type TEXT,
        pending_reason TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS nursing_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        note_ar TEXT NOT NULL,
        note_en TEXT NOT NULL,
        translation_approved INTEGER DEFAULT 0,
        author_id INTEGER NOT NULL,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS pending_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        description_ar TEXT NOT NULL,
        description_en TEXT NOT NULL,
        priority TEXT NOT NULL, -- 'high', 'medium', 'routine'
        due_time TEXT NOT NULL,
        status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'requires_follow_up'
        responsible_nurse_id INTEGER,
        created_shift_id INTEGER NOT NULL,
        transferred_to_shift INTEGER,
        notes TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS handover_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        outgoing_nurse_id INTEGER NOT NULL,
        incoming_nurse_id INTEGER,
        shift_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL, -- 'draft', 'submitted', 'clarification_needed', 'acknowledged'
        situation TEXT NOT NULL,
        background TEXT NOT NULL,
        assessment TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        traceability_metadata TEXT, -- JSON showing documented sources
        validation_status TEXT, -- 'green', 'yellow', 'red'
        clarification_text TEXT,
        clarification_response TEXT,
        signed_at TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id),
        FOREIGN KEY(outgoing_nurse_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS handover_confirmations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handover_id INTEGER NOT NULL,
        receiving_nurse_id INTEGER NOT NULL,
        confirmed_at TEXT NOT NULL,
        acknowledgment_notes TEXT,
        FOREIGN KEY(handover_id) REFERENCES handover_reports(id),
        FOREIGN KEY(receiving_nurse_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        message_ar TEXT NOT NULL,
        message_en TEXT NOT NULL,
        type TEXT NOT NULL, -- 'handover_ready', 'urgent_lab', 'task_reminder', 'clarification'
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        link_target TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id INTEGER,
        user_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_demo_data(conn)
    conn.close()

def seed_demo_data(conn):
    cursor = conn.cursor()

    # Check if users already exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        return

    now_iso = datetime.now().isoformat()

    # 1. Users
    users = [
        (1, "sarah", "nurse123", "سارة العتيبي", "Sarah Al-Otaibi", "nurse", "NUR-4091", "وحدة العناية القلبية (CCU)", "👩‍⚕️"),
        (2, "noura", "nurse123", "نورة الشهري", "Noura Al-Shehri", "receiving_nurse", "NUR-4120", "وحدة العناية القلبية (CCU)", "👩‍⚕️"),
        (3, "mona", "admin123", "د. منى الزهراني", "Dr. Mona Al-Zahrani", "supervisor", "SUP-1002", "إدارة التمريض العام", "👨‍⚕️")
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", users)

    # 2. Departments
    depts = [
        (1, "وحدة العناية القلبية (CCU)", "Cardiac Care Unit (CCU)", "الدور الثاني - جناح A"),
        (2, "العناية المركزة (ICU)", "Intensive Care Unit (ICU)", "الدور الثالث - جناح C"),
        (3, "جراحة الباطنية", "General Surgery Ward", "الدور الأول - جناح B"),
        (4, "قسم الباطنة", "Internal Medicine Ward", "الدور الثاني - جناح B")
    ]
    cursor.executemany("INSERT INTO departments VALUES (?, ?, ?, ?)", depts)

    # 3. Shifts
    shifts = [
        (1, "المناوبة الصباحية", "Morning Shift", "morning", "07:00", "15:00"),
        (2, "المناوبة المسائية", "Evening Shift", "evening", "15:00", "23:00"),
        (3, "المناوبة الليلية", "Night Shift", "night", "23:00", "07:00")
    ]
    cursor.executemany("INSERT INTO shifts VALUES (?, ?, ?, ?, ?, ?)", shifts)

    # 4. Patients (Patient 101, 102, 103)
    patients = [
        (
            101, "MRN-88204", "فهد العتيبي", "Fahad Al-Otaibi", 58, "ذكر / Male",
            "204", "Bed 1", "وحدة العناية القلبية (CCU)", "observation",
            "احتشاء عضلة القلب الحاد بعد القسطرة (Post-PCI STEMI)",
            "Acute ST-Elevation Myocardial Infarction Post-PCI",
            "2026-11-22", "البنسلين (Penicillin Allergy - Rash)", "Full Code",
            "حمية قليلة الصوديوم (Low Salt)", "راحة في السرير مع مساعدة (Bedrest with assist)",
            15, "قبل 20 دقيقة (14:20)"
        ),
        (
            102, "MRN-77319", "نورة الدوسري", "Noura Al-Dosari", 42, "أنثى / Female",
            "206", "Bed 2", "وحدة العناية القلبية (CCU)", "stable",
            "ما بعد استئصال المرارة بالمنظار (Post-Laparoscopic Cholecystectomy)",
            "Post-Laparoscopic Cholecystectomy (Day 1)",
            "2026-11-23", "لا توجد حساسية معروفة (NKDA)", "Full Code",
            "سوائل صافية (Clear Liquids)", "حركة مستقلة في الغرفة (Ambulatory)",
            15, "قبل ساعة (13:30)"
        ),
        (
            103, "MRN-91042", "سالم الغامدي", "Salem Al-Ghamdi", 67, "ذكر / Male",
            "208", "Bed 1", "وحدة العناية القلبية (CCU)", "critical",
            "قصور القلب الاحتقاني الحاد مع وذمة رئوية (Acute Decompensated Heart Failure)",
            "Acute Decompensated Heart Failure with Pulmonary Edema",
            "2026-11-21", "سلفا (Sulfa Drugs)", "DNR (Do Not Resuscitate)",
            "تحديد سوائل صارم 1.5 لتر/يوم (Strict Fluid Restriction)", "راحة تامة بالسرير (Complete Bedrest)",
            14, "قبل 15 دقيقة (14:25)"
        )
    ]
    cursor.executemany("""
    INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, patients)

    # 5. Assignments (Sarah assigned to 101, 102, 103 in Morning Shift; Noura incoming for Evening Shift)
    assignments = [
        (1, 1, 101, 1, "2026-11-24"),
        (2, 1, 102, 1, "2026-11-24"),
        (3, 1, 103, 1, "2026-11-24"),
        (4, 2, 101, 2, "2026-11-24"),
        (5, 2, 102, 2, "2026-11-24"),
        (6, 2, 103, 2, "2026-11-24")
    ]
    cursor.executemany("INSERT INTO nurse_assignments VALUES (?, ?, ?, ?, ?)", assignments)

    # 6. Vital Signs for Patient 101
    vitals_101 = [
        (1, 101, "2026-11-24 08:00", 138, 88, 86, 36.9, 20, 97, 1, "بداية المناوبة - مستقر"),
        (2, 101, "2026-11-24 12:00", 132, 84, 80, 37.0, 18, 98, 1, "فحص دوري بعد العلاج"),
        (3, 101, "2026-11-24 14:00", 130, 82, 78, 37.1, 18, 98, 1, "علامات حيوية قبل التسليم - مستقر سريرياً وبدون ألم بالصدر")
    ]
    cursor.executemany("INSERT INTO vital_signs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", vitals_101)

    # Vitals for Patient 102
    vitals_102 = [
        (4, 102, "2026-11-24 13:00", 120, 78, 74, 36.8, 16, 99, 1, "ألم الجرح خفيف 2/10 بعد المسكن")
    ]
    cursor.executemany("INSERT INTO vital_signs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", vitals_102)

    # Vitals for Patient 103
    vitals_103 = [
        (5, 103, "2026-11-24 14:00", 155, 95, 98, 37.2, 24, 93, 1, "على أكسجين 3 لتر عبر القنية الأنفية - يحتاج مراقبة مستمرة للعلامات الحيوية")
    ]
    cursor.executemany("INSERT INTO vital_signs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", vitals_103)

    # 7. Medication Records for Patient 101
    meds = [
        (1, 101, "أسبرين (Aspirin)", "Aspirin", "81 mg", "فموي (Oral)", "مرة واحدة يومياً (OD)", "08:00", "administered", "08:05", "تم الإعطاء مع وجبة الإفطار الخفيفة"),
        (2, 101, "كلوبيدوغريل (Plavix)", "Clopidogrel", "75 mg", "فموي (Oral)", "مرة واحدة يومياً (OD)", "08:00", "administered", "08:05", "جرعة التثبيت بعد القسطرة"),
        (3, 101, "أتورفاستاتين (Lipitor)", "Atorvastatin", "40 mg", "فموي (Oral)", "ليلاً عند النوم (HS)", "21:00", "pending", None, "مجدول للمناوبة المسائية"),
        (4, 101, "تسريب الهيبارين المستمر (IV Heparin Infusion)", "Heparin IV Infusion", "1000 units/hr", "وريدي مستمر (IV Infusion)", "مستمر (Continuous)", "10:00", "administered", "10:00", "تسريب منتظم، تم التحقق من الجرعة مع الممرضة المسؤولة"),
        # Patient 102
        (5, 102, "باراسيتامول وريدي (IV Paracetamol)", "Paracetamol IV", "1 g", "وريدي (IV)", "كل 6 ساعات (Q6H)", "12:00", "administered", "12:00", "تسكين ألم ما بعد العملية"),
        # Patient 103
        (6, 103, "فيوروسيميد (Lasix)", "Furosemide", "40 mg", "وريدي بطيء (IV Slow)", "مرتين يومياً (BID)", "14:00", "administered", "14:00", "إدرار البول تحت المراقبة")
    ]
    cursor.executemany("INSERT INTO medication_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", meds)

    # 8. Laboratory Tests (Crucial: Patient 101 has one PENDING Troponin-I test)
    labs = [
        (
            1, 101, "إنزيمات القلب: تروبونين آي مكرر (Repeat Troponin-I)", "Repeat Troponin-I",
            "2026-11-24 12:30", "pending", None, "< 0.04 ng/mL", "Serum (مصل الدم)",
            "العينة سحبت وأرسلت للمختبر المركزي الساعة 12:35، بانتظار اعتماد النتيجة من المختبر"
        ),
        (
            2, 101, "تعداد الدم الكامل (Complete Blood Count - CBC)", "Complete Blood Count",
            "2026-11-24 07:30", "completed", "Hb: 13.8 g/dL, WBC: 8.4, PLT: 240k", "Hb: 13-17 g/dL", "Whole Blood",
            None
        ),
        (
            3, 101, "غازات الدم الشرياني (ABG)", "Arterial Blood Gas (ABG)",
            "2026-11-24 08:30", "completed", "pH: 7.41, pCO2: 38, pO2: 95, HCO3: 24", "Normal Acid-Base", "Arterial Blood",
            None
        ),
        (
            4, 102, "وظائف الكلى والكهارل (Electrolytes & Urea)", "Urea & Electrolytes",
            "2026-11-24 09:00", "completed", "K+: 4.1 mmol/L, Na+: 139 mmol/L, Creatinine: 0.9 mg/dL", "Normal", "Serum",
            None
        ),
        (
            5, 103, "الببتيد الدماغي المدر للصوديوم (NT-proBNP)", "NT-proBNP",
            "2026-11-24 11:00", "completed", "3800 pg/mL (مرتفع جداً)", "< 300 pg/mL", "Plasma",
            "مؤشر على قصور القلب الاحتقاني النشط"
        )
    ]
    cursor.executemany("INSERT INTO laboratory_tests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", labs)

    # 9. Nursing Notes
    notes = [
        (
            1, 101, "2026-11-24 14:15",
            "المريض فهد العتيبي (58 سنة) منوم بعد قسطرة تاجية علاجية وزراعة دعامة شريانية. الحالة العامة مستقرة، واعي ومتجاوب بدرجة 15 على مقياس غلاسكو. ينفي وجود أي ألم في الصدر أو خفقان. تم فحص موضع وخز القسطرة الفخذية الأيمن، الضماد جاف وسليم ولا يوجد تورم دموي (hematoma) ونبض الشريان الظنبوبي محسوس +2. سحبت عينة تروبونين المتابعة وبانتظار النتيجة من المختبر. الهيبارين مستمر بمعدل 1000 وحدة/ساعة.",
            "Patient Fahad Al-Otaibi (58yo) admitted post-percutaneous coronary intervention (PCI) with stent placement. Patient is clinically stable, alert and oriented (GCS 15). Denies chest pain or shortness of breath. Right femoral puncture site inspected: pressure dressing dry and intact with no hematoma, distal pedal pulses +2 palpable bilaterally. Repeat troponin sample drawn at 12:30 and pending lab release. IV Heparin infusion continues at 1000 units/hr without complications.",
            1, 1
        )
    ]
    cursor.executemany("INSERT INTO nursing_notes VALUES (?, ?, ?, ?, ?, ?, ?)", notes)

    # 10. Pending Tasks (Crucial: Patient 101 has an incomplete task scheduled at 16:00)
    tasks = [
        (
            1, 101,
            "فحص موقع القسطرة الفخذية اليمنى وتوثيق النبض البعيد للقدمين",
            "Inspect right femoral sheath puncture site and assess distal pedal pulses",
            "high", "16:00", "pending", 1, 1, 2,
            "مهمة حرجة يجب إجراؤها بعد ساعة من بداية المناوبة المسائية للتأكد من عدم وجود نزيف خفي"
        ),
        (
            2, 101,
            "متابعة نتيجة فحص التروبونين-آي المكرر وإبلاغ طبيب القلب المناوب حال صدورها",
            "Follow up on repeat Troponin-I result and notify on-duty cardiologist upon release",
            "high", "15:30", "requires_follow_up", 1, 1, 2,
            "عينة الساعة 12:30 في المختبر المركزي"
        ),
        (
            3, 101,
            "إعطاء جرعة أتورفاستاتين 40 ملغ مساءً",
            "Administer Atorvastatin 40mg PO at bedtime",
            "routine", "21:00", "pending", None, 1, 2,
            "مجدول للمناوبة المسائية"
        ),
        (
            4, 102,
            "مساعدة المريضة على المشي للمرة الثانية وتفريغ مجمع تصريف الجرح (JP Drain)",
            "Assist patient with second ambulation and empty Jackson-Pratt wound drain",
            "medium", "17:00", "pending", None, 1, 2,
            "توثيق كمية السائل المسحوب ولونه"
        ),
        (
            5, 103,
            "قياس وتوثيق ميزان السوائل الصارم (Strict Intake/Output chart) وتكرار العلامات الحيوية",
            "Record strict 4-hour Intake/Output balance and repeat vital signs",
            "high", "16:00", "pending", None, 1, 2,
            "المريض يخضع لعلاج مدرات البول المكثف"
        )
    ]
    cursor.executemany("INSERT INTO pending_tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tasks)

    # 11. Initial Handover Draft for Patient 101
    situation = "المريض فهد العتيبي (58 عاماً)، ملف رقم MRN-88204، منوم في وحدة CCU غرفة 204 سرير 1. منوم بعد قسطرة علاجية وزراعة دعامة شريانية (PCI STEMI). الحالة الحالية مستقرة بدون ألم في الصدر."
    background = "تاريخ مرضي: ارتفاع ضغط الدم والتدخين. يعاني من حساسية شديدة للبنسلين (Penicillin Allergy). كود الإنعاش: Full Code. القسطرة أجريت بنجاح صباح أمس عبر الشريان الفخذي الأيمن."
    assessment = "العلامات الحيوية عند الساعة 14:00 مستقرة: ضغط الدم 130/82 ملم زئبق، النبض 78 د/د، الحرارة 37.1 م، التنفس 18 د/د، تشبع الأكسجين 98% على هواء الغرفة. واعي بدرجة GCS 15. موقع الوخز الفخذي سليم بدون تورم. الهيبارين الوريدي مستمر بانتظام بمعدل 1000 وحدة/ساعة."
    recommendation = "1) متابعة نتيجة فحص التروبونين المكرر المسحوب الساعة 12:30 وإبلاغ الطبيب فور صدورها. 2) فحص موضع القسطرة والنبض البعيد في تمام الساعة 16:00. 3) إعطاء أتورفاستاتين 40 ملغ الساعة 21:00. 4) الإبقاء على مراقبة تخطيط القلب المستمر (Telemetry)."

    traceability = json.dumps([
        {"item": "العلامات الحيوية (130/82، نبض 78، SpO2 98%)", "source": "سجل العلامات الحيوية الساعة 14:00 بواسطة الممرضة سارة"},
        {"item": "تسريب الهيبارين 1000 وحدة/ساعة", "source": "سجل إعطاء الأدوية الوريدية (eMAR)"},
        {"item": "حساسية البنسلين", "source": "الملف الطبي الأساسي للمريض"},
        {"item": "فحص التروبونين المكرر معلق", "source": "طلب المختبر رقم LAB-4091 المسحوب 12:30"},
        {"item": "فحص موقع الفخذ الساعة 16:00", "source": "قائمة المهام التمريضية للمناوبة القادمة"}
    ], ensure_ascii=False)

    cursor.execute("""
    INSERT INTO handover_reports (
        id, patient_id, outgoing_nurse_id, incoming_nurse_id, shift_id,
        created_at, status, situation, background, assessment, recommendation,
        traceability_metadata, validation_status, clarification_text, signed_at
    ) VALUES (
        1, 101, 1, 2, 1,
        ?, 'submitted', ?, ?, ?, ?,
        ?, 'yellow', NULL, ?
    )
    """, (now_iso, situation, background, assessment, recommendation, traceability, now_iso))

    # 12. Notifications
    notifs = [
        (
            1, 2, "تقرير تسليم جاهز للمراجعة (Patient 101)", "Handover Report Ready for Review",
            "أرسلت الممرضة سارة العتيبي تقرير تسليم المريض فهد العتيبي (CCU - 204) مع تنبيه وجود نتائج مخبرية معلقة.",
            "Nurse Sarah Al-Otaibi sent a handover report for Patient Fahad Al-Otaibi (CCU - 204) with pending lab alerts.",
            "handover_ready", 0, now_iso, "/handover/101"
        ),
        (
            2, 2, "تنبيه مهمة ذات أولوية عالية", "High Priority Task Alert",
            "مهمة فحص موضع القسطرة الفخذية للمريض 101 مستحقة الساعة 16:00.",
            "Femoral puncture site inspection for Patient 101 is due at 16:00.",
            "task_reminder", 0, now_iso, "/tasks"
        ),
        (
            3, 3, "إشعار بدء تسليم المناوبة الصباحية للمسائية", "Shift Handover Initiated",
            "بدأت إجراءات تسليم المناوبة في وحدة العناية القلبية (CCU) بنسبة إنجاز 75%.",
            "Shift handover initiated in CCU ward with 75% progress.",
            "handover_ready", 0, now_iso, "/supervisor"
        )
    ]
    cursor.executemany("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", notifs)

    # 13. Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (action, entity, entity_id, user_id, timestamp, details)
    VALUES ('GENERATE_HANDOVER', 'handover_report', 1, 1, ?, 'تم توليد وتوقيع تقرير التسليم الذكي للمريض فهد العتيبي بنجاح من الممرضة سارة العتيبي')
    """, (now_iso,))

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully.")
