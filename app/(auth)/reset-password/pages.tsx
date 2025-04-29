'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js'; //  Supabase import first
import { useRouter, useSearchParams } from 'next/navigation';      //  Next.js imports next
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
