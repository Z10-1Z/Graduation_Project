<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\User;

class DoctorPatientAccess
{
    public static function doctorHasPatient(int $doctorId, int $patientId): bool
    {
        if ($patientId <= 0) {
            return false;
        }

        return Appointment::query()
            ->where('doctor_id', $doctorId)
            ->where('patient_id', $patientId)
            ->exists();
    }

    public static function ensureDoctorPatient(int $doctorId, User $patient): void
    {
        if ($patient->role !== 'patient') {
            abort(404);
        }

        if (! self::doctorHasPatient($doctorId, (int) $patient->id)) {
            abort(404, 'Patient not found in your list.');
        }
    }
}
